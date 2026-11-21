import nodemailer from "nodemailer";
import type { EmailMessage, EmailSender } from "../ports/emailSender.js";

interface SmtpOptions {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
}

export class SmtpEmailSender implements EmailSender {
  private readonly transport;

  constructor(private readonly options: SmtpOptions) {
    this.transport = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      auth: options.user ? { user: options.user, pass: options.pass } : undefined,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transport.sendMail({ from: this.options.from, ...message });
  }
}
