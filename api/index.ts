import type { BrowserWorker } from "@cloudflare/puppeteer";
import { Hono } from "hono";
import { PatternRouter } from "hono/router/pattern-router";

import ogp from "./routes/ogp";

export type Bindings = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  BROWSER: BrowserWorker;
};

const app = new Hono<{ Bindings: Bindings }>({ router: new PatternRouter() });

app.route("/api/ogp", ogp);

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
