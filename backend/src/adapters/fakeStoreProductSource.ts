import type { Product } from "../domain/product.js";
import type { ProductSource } from "../ports/productSource.js";

export class UpstreamError extends Error {}

interface Options {
  baseUrl: string;
  ttlMs?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

/** Reads from fakestoreapi.com, caching the whole (tiny) catalogue in memory. */
export class FakeStoreProductSource implements ProductSource {
  private cache: { at: number; products: Product[] } | null = null;
  private readonly ttlMs: number;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;

  constructor(private readonly options: Options) {
    this.ttlMs = options.ttlMs ?? 5 * 60_000;
    this.timeoutMs = options.timeoutMs ?? 5_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.now = options.now ?? Date.now;
  }

  async listProducts(): Promise<Product[]> {
    if (this.cache && this.now() - this.cache.at < this.ttlMs) return this.cache.products;
    try {
      const res = await this.fetchImpl(`${this.options.baseUrl}/products`, {
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!res.ok) throw new UpstreamError(`Fake Store API responded ${res.status}`);
      const products = (await res.json()) as Product[];
      this.cache = { at: this.now(), products };
      return products;
    } catch (err) {
      // Serve stale data rather than failing if the upstream is down.
      if (this.cache) return this.cache.products;
      if (err instanceof UpstreamError) throw err;
      throw new UpstreamError(`Could not reach Fake Store API: ${(err as Error).message}`);
    }
  }

  async getProduct(id: number): Promise<Product | null> {
    const products = await this.listProducts();
    return products.find((p) => p.id === id) ?? null;
  }
}
