# Product Catalogue (PoC)

Browse, search and enquire about products. React + TypeScript web app, Node.js + TypeScript API, product data from the [Fake Store API](https://fakestoreapi.com) (via the backend only).

**Choices:** React web client and Node/TypeScript backend: one language across the stack, so the same people can own both, and the web client needs no emulator for the reviewer. Express is used for the API because it is small and well known.

## Run it

### Option A: Docker (one command)
```sh
docker compose up --build
```
- App: http://localhost:8080
- Sales inbox (Mailpit, catches outgoing enquiry emails): http://localhost:8025

### Option B: Node 20+ (no Docker)
```sh
# terminal 1: API (emails are printed to this terminal)
cd backend && npm install && cp .env.example .env
EMAIL_PROVIDER=console npm run dev

# terminal 2: web app
cd frontend && npm install && npm run dev
```
Open http://localhost:5173. (Vite proxies `/api` to the backend on port 3001.)

With the default `EMAIL_PROVIDER=smtp` the API expects an SMTP server at `localhost:1025`; run Mailpit locally or use `console`.

### Tests
```sh
cd backend && npm test      # API, services, upstream adapter
cd frontend && npm test     # pages, search and enquiry flows
```

## Configuration
All backend config is environment variables, documented in [backend/.env.example](backend/.env.example). No secrets are committed; real SMTP credentials would be supplied by the deployment environment.

## API
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/featured` | 5 top rated products |
| GET | `/api/categories` | category names |
| GET | `/api/categories/:name` | `{ topRated, others }` |
| GET | `/api/search?q=` | products whose title, description or category match every term |
| GET | `/api/products/:id` | one product |
| POST | `/api/enquiries` | validates, emails the sales inbox, returns 202 |

## Structure
```
backend/src
  domain/     plain types
  ports/      ProductSource, EmailSender interfaces
  adapters/   FakeStoreProductSource, SmtpEmailSender, ConsoleEmailSender
  services/   catalogue + enquiry rules (no HTTP, no vendor code)
  http/       routes, validation, error mapping
  server.ts   composition root
frontend/src
  api/        the only place that knows backend URLs
  pages/ components/ styles.css (design tokens)
```
See [DECISIONS.md](DECISIONS.md) for assumptions and trade-offs and [AI_USAGE.md](AI_USAGE.md) for how AI was used.
