import type { Product } from "../src/domain/product.js";
import type { EmailMessage, EmailSender } from "../src/ports/emailSender.js";
import type { ProductSource } from "../src/ports/productSource.js";

export const product = (id: number, category: string, rate: number, title = `Product ${id}`): Product => ({
  id,
  title,
  price: 10 + id,
  description: `Description of ${title}`,
  category,
  image: `https://img.example/${id}.png`,
  rating: { rate, count: 100 },
});

export const PRODUCTS: Product[] = [
  product(1, "electronics", 4.9, "Gaming Laptop"),
  product(2, "electronics", 4.5, "USB Cable"),
  product(3, "electronics", 3.1, "Wireless Mouse"),
  product(4, "electronics", 2.0, "Old Monitor"),
  product(5, "jewelery", 4.8, "Gold Ring"),
  product(6, "jewelery", 4.7, "Silver Necklace"),
  product(7, "men's clothing", 4.6, "Cotton Jacket"),
  product(8, "men's clothing", 1.5, "Plain Tee"),
];

export class FakeSource implements ProductSource {
  constructor(private products: Product[] = PRODUCTS) {}
  async listProducts() {
    return this.products;
  }
  async getProduct(id: number) {
    return this.products.find((p) => p.id === id) ?? null;
  }
}

export class RecordingEmail implements EmailSender {
  sent: EmailMessage[] = [];
  failWith?: Error;
  async send(message: EmailMessage) {
    if (this.failWith) throw this.failWith;
    this.sent.push(message);
  }
}
