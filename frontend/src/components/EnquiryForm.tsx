import { type FormEvent, useState } from "react";
import { ApiError, api } from "../api/client";
import type { Product } from "../api/types";

export function EnquiryForm({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (status === "sent") {
    return <p role="status" className="thanks">Thank you! Your enquiry has been sent and we'll be in touch soon.</p>;
  }
  if (!open) return <button onClick={() => setOpen(true)}>Enquire</button>;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("sending");
    setFieldErrors({});
    try {
      await api.submitEnquiry({
        productId: product.id,
        name: String(data.get("name")),
        email: String(data.get("email")),
        phone: String(data.get("phone") ?? "") || undefined,
        message: String(data.get("message")),
      });
      setStatus("sent");
    } catch (err) {
      if (err instanceof ApiError) setFieldErrors(err.fields);
      setStatus("error");
    }
  };

  const err = (name: string) => fieldErrors[name] && <span role="alert" className="field-error">{fieldErrors[name]}</span>;

  return (
    <form onSubmit={submit} className="enquiry">
      <h2>Enquire about {product.title}</h2>
      <label>Name <input name="name" required maxLength={100} />{err("name")}</label>
      <label>Email <input name="email" type="email" required maxLength={200} />{err("email")}</label>
      <label>Phone (optional) <input name="phone" type="tel" maxLength={30} />{err("phone")}</label>
      <label>Message <textarea name="message" required maxLength={2000} rows={4} />{err("message")}</label>
      {status === "error" && Object.keys(fieldErrors).length === 0 && (
        <p role="alert">We couldn't send your enquiry. Please try again.</p>
      )}
      <button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send enquiry"}</button>
    </form>
  );
}
