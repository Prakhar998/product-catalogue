import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/http/app.js";
import { CatalogueService } from "../src/services/catalogueService.js";
import { EnquiryService } from "../src/services/enquiryService.js";
import { FakeSource, RecordingEmail } from "./fixtures.js";

let email: RecordingEmail;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  const source = new FakeSource();
  email = new RecordingEmail();
  app = createApp({
    catalogue: new CatalogueService(source),
    enquiries: new EnquiryService(source, email, "sales@shop.test"),
  });
});

const valid = { productId: 1, name: "Ada", email: "ada@example.com", message: "Is it in stock?" };

describe("catalogue endpoints", () => {
  it("GET /api/featured returns 5 products", async () => {
    const res = await request(app).get("/api/featured");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
  });

  it("GET /api/categories/:name returns topRated and others", async () => {
    const res = await request(app).get("/api/categories/electronics");
    expect(res.body.topRated).toHaveLength(3);
    expect(res.body.others).toHaveLength(1);
  });

  it("GET /api/categories/:name handles URL-encoded names and 404s", async () => {
    expect((await request(app).get("/api/categories/men's%20clothing")).status).toBe(200);
    expect((await request(app).get("/api/categories/nope")).status).toBe(404);
  });

  it("GET /api/search filters by term", async () => {
    const res = await request(app).get("/api/search").query({ q: "ring" });
    expect(res.body.map((p: { id: number }) => p.id)).toEqual([5]);
  });

  it("GET /api/products/:id returns product, 404 or 400", async () => {
    expect((await request(app).get("/api/products/2")).body.title).toBe("USB Cable");
    expect((await request(app).get("/api/products/999")).status).toBe(404);
    expect((await request(app).get("/api/products/abc")).status).toBe(400);
  });
});

describe("POST /api/enquiries", () => {
  it("emails the sales inbox and acknowledges", async () => {
    const res = await request(app).post("/api/enquiries").send(valid);
    expect(res.status).toBe(202);
    expect(email.sent).toHaveLength(1);
    expect(email.sent[0]).toMatchObject({ to: "sales@shop.test", replyTo: "ada@example.com" });
    expect(email.sent[0]?.text).toContain("Gaming Laptop");
    expect(email.sent[0]?.text).toContain("Is it in stock?");
  });

  it("rejects invalid input with field errors and sends nothing", async () => {
    const res = await request(app).post("/api/enquiries").send({ ...valid, email: "nope", name: "" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fields)).toEqual(expect.arrayContaining(["email", "name"]));
    expect(email.sent).toHaveLength(0);
  });

  it("404s for an unknown product", async () => {
    const res = await request(app).post("/api/enquiries").send({ ...valid, productId: 999 });
    expect(res.status).toBe(404);
    expect(email.sent).toHaveLength(0);
  });

  it("returns 500 (without leaking details) if email delivery fails", async () => {
    email.failWith = new Error("smtp exploded");
    const res = await request(app).post("/api/enquiries").send(valid);
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("smtp");
  });

  it("rate limits repeated submissions", async () => {
    const limited = createApp({
      catalogue: new CatalogueService(new FakeSource()),
      enquiries: new EnquiryService(new FakeSource(), email, "sales@shop.test"),
      enquiryRateLimit: 2,
    });
    await request(limited).post("/api/enquiries").send(valid);
    await request(limited).post("/api/enquiries").send(valid);
    expect((await request(limited).post("/api/enquiries").send(valid)).status).toBe(429);
  });
});
