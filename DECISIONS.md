# Decisions and assumptions

## Assumptions (acceptance criteria left gaps)
- **"Chosen" top rated products:** there is no admin to choose products, so "top rated" is computed from rating (rate, then review count, then id). Home shows the top 5. Curation (a hand-picked list) can replace this by changing one method in `CatalogueService.featured`.
- **Category page:** top 3 by rating are "top rated"; the rest are "additional". Category names are matched case-insensitively.
- **Search:** case-insensitive; every word must appear in title, description or category. Blank search returns nothing. It runs on the backend so a real search engine can replace it later.
- **Enquiry form fields:** name, email, optional phone, message (max 2000). The product is attached automatically.
- **Success means accepted, not delivered:** the API sends the email synchronously and returns 202 only if the provider accepted it; otherwise the customer sees an error. No retries or queue.
- **Email recipient:** a single sales inbox from `SALES_INBOX`; `Reply-To` is the customer so sales can answer directly. No confirmation email to the customer.
- **Prices** are shown in USD as the Fake Store API provides them.
- **No auth, no accounts, no cart.**

## Dropped or simplified
- No database: the catalogue is read-only and tiny. Enquiries are not stored, so a failed email is lost (the customer is told). Next step: persist before sending.
- Rate limit is in-memory per instance (10 enquiries/minute/IP); fine for a PoC, needs a shared store behind multiple instances.
- No pagination: the source has 20 products.
- Docker Compose is written but was **not run** by the author (Docker was not installed on the dev machine); the non-Docker path was run end to end.
- Visual design is deliberately plain, as creative work is pending.

## How the design grows
- **Data source changes:** implement `ProductSource`, swap it in `server.ts`. Services, routes and the client are untouched. The domain `Product` type is ours, so a new source maps into it.
- **Email provider changes:** implement `EmailSender` (SES etc.). `SmtpEmailSender` already works with any SMTP provider via env vars.
- **Look and feel changes:** colours, spacing and radius are CSS variables; components contain no styling decisions. The client never sees the upstream, only our `/api`.
- **AWS:** both images are stateless containers (ECS/Fargate behind an ALB, or App Runner); config is env vars (Secrets Manager for SMTP creds); SES can be used over SMTP.
- The upstream response is cached for 5 minutes, and stale data is served if it goes down.

## With another day
- Persist enquiries (Postgres/DynamoDB) and send email via a queue with retry.
- Curated featured list and category images/metadata; admin for it.
- Pagination and server-side sort; proper search index when data grows.
- Contract test against the real Fake Store response shape; Playwright smoke test through Docker.
- CI (typecheck + tests), structured logging, request IDs, CAPTCHA/honeypot on the form.
