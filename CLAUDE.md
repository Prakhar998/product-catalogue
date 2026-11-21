# Agent instructions

Product catalogue PoC: `backend/` (Node, Express, TypeScript) and `frontend/` (React, Vite, TypeScript).

## Architecture rules
- Backend depends on **ports** (`src/ports`), never on concrete adapters. Only `src/server.ts` wires adapters in.
- New data source / email provider = new class in `src/adapters` + one line in `server.ts`. Do not change services.
- The client only calls `/api/*` through `frontend/src/api/client.ts`. Never call the Fake Store API from the client.
- Visual styling lives in CSS variables in `frontend/src/styles.css`.
- Validate all external input with zod at the HTTP boundary. Never put secrets in the repo; document config in `.env.example`.

## Workflow
- Run `npm run typecheck && npm test` in the package you changed before finishing.
- Add a test for every behaviour change. Backend tests use fakes from `backend/test/fixtures.ts`, not the network.
- Commit messages: no AI co-author trailers.
