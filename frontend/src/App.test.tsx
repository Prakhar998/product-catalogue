import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import type { Product } from "./api/types";

const product = (id: number, title: string): Product => ({
  id, title, price: 9.99, description: `About ${title}`, category: "electronics",
  image: "x.png", rating: { rate: 4.5, count: 10 },
});
const laptop = product(1, "Laptop");

let calls: { url: string; init?: RequestInit }[];

function mockApi(overrides: Record<string, () => Response> = {}) {
  const routes: Record<string, () => Response> = {
    "/api/categories": () => Response.json(["electronics"]),
    "/api/featured": () => Response.json([laptop, product(2, "Mouse")]),
    "/api/search?q=laptop": () => Response.json([laptop]),
    "/api/products/1": () => Response.json(laptop),
    "/api/categories/electronics": () => Response.json({ topRated: [laptop], others: [product(3, "Cable")] }),
    "/api/enquiries": () => Response.json({ status: "received" }, { status: 202 }),
    ...overrides,
  };
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    const handler = routes[url];
    return handler ? handler() : Response.json({ error: "nope" }, { status: 404 });
  }));
}

const renderAt = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

beforeEach(() => { calls = []; mockApi(); });
afterEach(() => vi.unstubAllGlobals());

describe("catalogue", () => {
  it("shows featured products on the home page", async () => {
    renderAt("/");
    expect(await screen.findByRole("link", { name: "Laptop" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mouse" })).toBeInTheDocument();
  });

  it("shows top rated and additional products on a category page", async () => {
    renderAt("/categories/electronics");
    expect(await screen.findByText("Top rated in electronics")).toBeInTheDocument();
    expect(screen.getByText("More in electronics")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cable" })).toBeInTheDocument();
  });

  it("searches via the backend and shows only the matches", async () => {
    renderAt("/");
    await userEvent.type(screen.getByLabelText("Search products"), "laptop");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByRole("heading", { name: /Results for/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Laptop" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Mouse" })).not.toBeInTheDocument();
  });

  it("shows product details", async () => {
    renderAt("/products/1");
    expect(await screen.findByRole("heading", { name: "Laptop" })).toBeInTheDocument();
    expect(screen.getByText("About Laptop")).toBeInTheDocument();
  });

  it("only talks to /api, never to the Fake Store API", async () => {
    renderAt("/");
    await screen.findByRole("link", { name: "Laptop" });
    expect(calls.every((c) => c.url.startsWith("/api/"))).toBe(true);
  });
});

describe("enquiry", () => {
  async function fillAndSubmit() {
    renderAt("/products/1");
    await userEvent.click(await screen.findByRole("button", { name: "Enquire" }));
    await userEvent.type(screen.getByLabelText(/Name/), "Ada");
    await userEvent.type(screen.getByLabelText(/Email/), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/Message/), "Is it in stock?");
    await userEvent.click(screen.getByRole("button", { name: "Send enquiry" }));
  }

  it("submits the form and shows a thank you message", async () => {
    await fillAndSubmit();
    expect(await screen.findByText(/Thank you/)).toBeInTheDocument();
    const post = calls.find((c) => c.url === "/api/enquiries");
    expect(JSON.parse(String(post?.init?.body))).toMatchObject({ productId: 1, name: "Ada", email: "ada@example.com" });
  });

  it("shows an error, not a thank you, when sending fails", async () => {
    mockApi({ "/api/enquiries": () => Response.json({ error: "boom" }, { status: 500 }) });
    await fillAndSubmit();
    expect(await screen.findByText(/couldn't send/)).toBeInTheDocument();
    expect(screen.queryByText(/Thank you/)).not.toBeInTheDocument();
  });
});
