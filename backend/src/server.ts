import { ConsoleEmailSender } from "./adapters/consoleEmailSender.js";
import { FakeStoreProductSource } from "./adapters/fakeStoreProductSource.js";
import { SmtpEmailSender } from "./adapters/smtpEmailSender.js";
import { loadConfig } from "./config.js";
import { createApp } from "./http/app.js";
import { CatalogueService } from "./services/catalogueService.js";
import { EnquiryService } from "./services/enquiryService.js";

const config = loadConfig();

// Composition root: the only place that knows which concrete adapters are in use.
const products = new FakeStoreProductSource({ baseUrl: config.FAKESTORE_BASE_URL });
const email =
  config.EMAIL_PROVIDER === "console"
    ? new ConsoleEmailSender()
    : new SmtpEmailSender({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        user: config.SMTP_USER || undefined,
        pass: config.SMTP_PASS || undefined,
        from: config.MAIL_FROM,
      });

const app = createApp({
  catalogue: new CatalogueService(products),
  enquiries: new EnquiryService(products, email, config.SALES_INBOX),
  corsOrigins: config.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean),
});

app.listen(config.PORT, () => console.log(`API listening on http://localhost:${config.PORT}`));
