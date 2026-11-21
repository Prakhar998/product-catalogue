import type { Product } from "../domain/product.js";
import type { ProductSource } from "../ports/productSource.js";

export const FEATURED_COUNT = 5;
export const CATEGORY_TOP_COUNT = 3;

const byRating = (a: Product, b: Product) =>
  b.rating.rate - a.rating.rate || b.rating.count - a.rating.count || a.id - b.id;

export class CatalogueService {
  constructor(private readonly source: ProductSource) {}

  /** Top rated products across the whole catalogue. */
  async featured(): Promise<Product[]> {
    const all = await this.source.listProducts();
    return [...all].sort(byRating).slice(0, FEATURED_COUNT);
  }

  async categories(): Promise<string[]> {
    const all = await this.source.listProducts();
    return [...new Set(all.map((p) => p.category))].sort();
  }

  /** Returns null for an unknown category. */
  async category(name: string): Promise<{ topRated: Product[]; others: Product[] } | null> {
    const all = await this.source.listProducts();
    const inCategory = all.filter((p) => p.category.toLowerCase() === name.toLowerCase());
    if (inCategory.length === 0) return null;
    const ranked = [...inCategory].sort(byRating);
    return {
      topRated: ranked.slice(0, CATEGORY_TOP_COUNT),
      others: ranked.slice(CATEGORY_TOP_COUNT),
    };
  }

  /** Every whitespace-separated term must appear in the title, description or category. */
  async search(query: string): Promise<Product[]> {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    const all = await this.source.listProducts();
    return all.filter((p) => {
      const haystack = `${p.title} ${p.description} ${p.category}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }

  product(id: number): Promise<Product | null> {
    return this.source.getProduct(id);
  }
}
