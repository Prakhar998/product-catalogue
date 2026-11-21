import { describe, expect, it, vi } from "vitest";
import { FakeStoreProductSource, UpstreamError } from "../src/adapters/fakeStoreProductSource.js";
import { PRODUCTS } from "./fixtures.js";

const ok = () => new Response(JSON.stringify(PRODUCTS), { status: 200 });

describe("FakeStoreProductSource", () => {
  it("caches within the TTL", async () => {
    const fetchImpl = vi.fn(async () => ok());
    const source = new FakeStoreProductSource({ baseUrl: "http://x", fetchImpl });
    await source.listProducts();
    await source.listProducts();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("serves stale data when the upstream fails after expiry", async () => {
    let t = 0;
    const fetchImpl = vi.fn().mockResolvedValueOnce(ok()).mockRejectedValue(new Error("down"));
    const source = new FakeStoreProductSource({ baseUrl: "http://x", ttlMs: 10, fetchImpl, now: () => t });
    await source.listProducts();
    t = 100;
    expect(await source.listProducts()).toHaveLength(PRODUCTS.length);
  });

  it("throws UpstreamError when there is nothing cached", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 500 }));
    const source = new FakeStoreProductSource({ baseUrl: "http://x", fetchImpl });
    await expect(source.listProducts()).rejects.toBeInstanceOf(UpstreamError);
  });
});
