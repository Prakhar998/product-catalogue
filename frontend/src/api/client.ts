import type { CategoryListing, EnquiryInput, Product } from "./types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? "Request failed", body.fields);
  }
  return res.json() as Promise<T>;
}

/** The only module that knows the backend's URLs. Components never call fetch directly. */
export const api = {
  featured: () => request<Product[]>("/featured"),
  categories: () => request<string[]>("/categories"),
  category: (name: string) => request<CategoryListing>(`/categories/${encodeURIComponent(name)}`),
  search: (q: string) => request<Product[]>(`/search?q=${encodeURIComponent(q)}`),
  product: (id: number) => request<Product>(`/products/${id}`),
  submitEnquiry: (input: EnquiryInput) =>
    request<{ status: string }>("/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
};
