# AI usage notes

## Tools and models
- Claude Code (VS Code extension), model Claude Sonnet 5.5. Used for planning, scaffolding, writing code and tests, and drafting docs.
- Everything it produced was run (typecheck, tests, build, live API calls, Docker Compose) and I am responsible for the result.

## Agent instruction files
- [CLAUDE.md](CLAUDE.md) is committed. It encodes the architecture rules the agent had to follow: ports/adapters in the backend, the client only calls `/api`, validation at the HTTP boundary, a test for every behaviour change, no secrets in the repo.

## Plan
Agreed at the start, before any code:
- React + TypeScript client, Node + Express + TypeScript API (one language across the stack).
- `ProductSource` and `EmailSender` interfaces so the data source and email provider can change without touching services, routes or the client (the brief says both will change).
- Business rules (featured, category split, search) in services with no HTTP or vendor code, so they are unit-testable.
- Backend tests use in-memory fakes, never the network. Frontend tests mock `fetch`.
- Mailpit as a free local "sales inbox"; Docker Compose as the one-command run.

## Key prompts and moments
1. **The brief itself.** I gave the agent the full challenge. The line "data source, look and feel and email provider are expected to change" drove the ports/adapters structure and the CSS-variable styling.
2. **"Chosen" top rated products.** The criteria say the entrepreneur has chosen 5 products, but nothing exists to choose them. We decided to compute top rated from ratings and recorded it as an assumption in DECISIONS.md, with the swap point named (`CatalogueService.featured`).
3. **Test approach.** Tests use fakes rather than the live Fake Store API, plus a frontend test proving the client only calls `/api/*`. Separately, the real backend was smoke-tested against the live API.
4. **Make it a real repo.** Asked for a standalone folder, git history, a feature branch and a PR into `main`, as the brief requires.
5. **Run it in Docker.** Docker was not installed, so Compose was initially untested. I had it installed and run end to end rather than submit something unverified.

## Where the AI got things wrong, and how it was caught
- **Missing Node types in the frontend config.** `vite.config.ts` used `process.env` without `@types/node`. `tsc` failed the build; fixed by adding the types.
- **Docker Compose was written without being run.** It was initially flagged as untested. After installing Docker, the first frontend build failed at `npm ci`; a rebuild with no changes succeeded, which points to a transient network error rather than a code fault. Compose was then verified: app on :8080, `/api` proxied through nginx, and an enquiry email received in Mailpit.
- **Stack traces in test output.** The email-failure test logs an expected error, which looks alarming in the output. I confirmed it is the intended path (the response is a 500 with no internal detail) and not a failing test.

## Time spent
About 2–3 hours in total. After the automated tests passed, the app was run and checked manually.
