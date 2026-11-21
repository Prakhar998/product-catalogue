# AI usage notes

> Draft written alongside the build. **Review and edit it so it reflects your own experience before submitting**: the interview will ask about it.

## Tools and models
- Claude Code (CLI/VS Code extension), model Claude Sonnet 5.5, for planning, scaffolding, tests and docs.

## Agent instruction files
- [CLAUDE.md](CLAUDE.md) encodes the architecture rules (ports/adapters, API-only client, validation at the boundary, tests per change).

## Plan
Plan agreed up front: React + Node/TS; `ProductSource` and `EmailSender` ports so data source and email provider are swappable; services hold the business rules; backend tests with in-memory fakes; Mailpit as a free local sales inbox; Docker Compose for the reviewer.

## Key prompts / moments
1. Pasting the challenge brief and asking the agent to build it: it picked the stack and the ports/adapters split from the "data source, look and feel and email provider will change" line.
2. Deciding "top rated" is computed rather than curated (no admin exists), and recording that as an assumption.
3. Asking for tests that use fakes rather than the network, plus a test proving the client only calls `/api`.
4. Asking the agent to smoke test the real backend against the live Fake Store API rather than trusting unit tests alone.

## Where the AI was wrong / what review caught
- The frontend `vite.config.ts` used `process.env` without Node types; `tsc` caught it and the build failed until `@types/node` was added.
- _Add your own review findings here._

## Time spent
_Fill in your actual time: planning / building / testing / reviewing._
