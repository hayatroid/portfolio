import type { BrowserWorker } from "@cloudflare/puppeteer";
import { Hono } from "hono";
import { PatternRouter } from "hono/router/pattern-router";

import atcoder from "./routes/atcoder";
import ogp from "./routes/ogp";
import scheduled from "./scheduled";

export type Bindings = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  ATCODER: {
    get(key: string, type: "json"): Promise<unknown>;
    put(key: string, value: string): Promise<void>;
  };
  BROWSER: BrowserWorker;
};

const app = new Hono<{ Bindings: Bindings }>({ router: new PatternRouter() });

app.route("/api/atcoder", atcoder);
app.route("/api/ogp", ogp);

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw));

export default { fetch: app.fetch, scheduled };
