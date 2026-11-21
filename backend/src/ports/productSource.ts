import type { Product } from "../domain/product.js";

/** Anything that can supply products. Swap the implementation to change data source. */
export interface ProductSource {
  listProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
}
