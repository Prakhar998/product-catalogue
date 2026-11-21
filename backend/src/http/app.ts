import express, { type ErrorRequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { UpstreamError } from "../adapters/fakeStoreProductSource.js";
import { CatalogueService } from "../services/catalogueService.js";
import { EnquiryService, ProductNotFoundError } from "../services/enquiryService.js";

export interface AppDeps {
  catalogue: CatalogueService;
  enquiries: EnquiryService;
  corsOrigins?: string[];
  enquiryRateLimit?: number;
}

const idSchema = z.coerce.number().int().positive();

const enquirySchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(1).max(2000),
});

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

// Express 4 doesn't catch rejected promises, so wrap async handlers.
const wrap =
  (fn: express.RequestHandler): express.RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function createApp({ catalogue, enquiries, corsOrigins = [], enquiryRateLimit = 10 }: AppDeps) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "20kb" }));

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && corsOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  const api = express.Router();

  api.get("/health", (_req, res) => res.json({ status: "ok" }));

  api.get("/featured", wrap(async (_req, res) => res.json(await catalogue.featured())));

  api.get("/categories", wrap(async (_req, res) => res.json(await catalogue.categories())));

  api.get(
    "/categories/:name",
    wrap(async (req, res) => {
      const result = await catalogue.category(String(req.params.name));
      if (!result) throw new HttpError(404, "Category not found");
      res.json(result);
    }),
  );

  api.get(
    "/search",
    wrap(async (req, res) => {
      const q = typeof req.query.q === "string" ? req.query.q : "";
      if (q.length > 100) throw new HttpError(400, "Search term too long");
      res.json(await catalogue.search(q));
    }),
  );

  api.get(
    "/products/:id",
    wrap(async (req, res) => {
      const id = idSchema.safeParse(req.params.id);
      if (!id.success) throw new HttpError(400, "Invalid product id");
      const product = await catalogue.product(id.data);
      if (!product) throw new HttpError(404, "Product not found");
      res.json(product);
    }),
  );

  api.post(
    "/enquiries",
    rateLimit({ windowMs: 60_000, limit: enquiryRateLimit, standardHeaders: true, legacyHeaders: false }),
    wrap(async (req, res) => {
      const parsed = enquirySchema.safeParse(req.body);
      if (!parsed.success) {
        const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
        return res.status(400).json({ error: "Invalid enquiry", fields });
      }
      await enquiries.submit(parsed.data);
      res.status(202).json({ status: "received" });
    }),
  );

  api.use((_req, _res, next) => next(new HttpError(404, "Not found")));
  app.use("/api", api);

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err instanceof ProductNotFoundError) return res.status(404).json({ error: "Product not found" });
    if (err instanceof UpstreamError) return res.status(502).json({ error: "Product data is unavailable" });
    if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "Malformed JSON" });
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  };
  app.use(onError);

  return app;
}
