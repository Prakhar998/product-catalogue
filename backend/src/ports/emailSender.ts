export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

/** Anything that can deliver email. Swap the implementation to change provider. */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
