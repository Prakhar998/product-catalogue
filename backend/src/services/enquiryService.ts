import type { Enquiry } from "../domain/product.js";
import type { EmailSender } from "../ports/emailSender.js";
import type { ProductSource } from "../ports/productSource.js";

export class ProductNotFoundError extends Error {}

export class EnquiryService {
  constructor(
    private readonly source: ProductSource,
    private readonly email: EmailSender,
    private readonly salesInbox: string,
  ) {}

  async submit(enquiry: Enquiry): Promise<void> {
    const product = await this.source.getProduct(enquiry.productId);
    if (!product) throw new ProductNotFoundError(`Product ${enquiry.productId} not found`);

    const lines = [
      `New enquiry for: ${product.title} (#${product.id}, $${product.price.toFixed(2)})`,
      "",
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      `Phone: ${enquiry.phone || "not provided"}`,
      "",
      "Message:",
      enquiry.message,
    ];
    await this.email.send({
      to: this.salesInbox,
      // Newlines are stripped so user input can never inject extra headers.
      subject: `Enquiry: ${product.title}`.replace(/[\r\n]+/g, " "),
      text: lines.join("\n"),
      replyTo: enquiry.email,
    });
  }
}
