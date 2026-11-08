import type { BrowserWorker } from "@cloudflare/puppeteer";
import { Hono } from "hono";
import { PatternRouter } from "hono/router/pattern-router";

import atcoder from "./routes/atcoder";
import ip from "./routes/ip";
import ogp from "./routes/ogp";
import run from "./routes/run";
import type { Sandbox } from "./sandbox";
import scheduled from "./scheduled";

export type Bindings = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  ATCODER: {
    get(key: string, type: "json"): Promise<unknown>;
    put(key: string, value: string): Promise<void>;
  };
  BROWSER: BrowserWorker;
  SANDBOX: DurableObjectNamespace<Sandbox>;
  TURNSTILE_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>({ router: new PatternRouter() });

app.route("/api/atcoder", atcoder);
app.route("/api/ip", ip);
app.route("/api/ogp", ogp);
app.route("/api/run", run);

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw));

export { Sandbox } from "./sandbox";

export default { fetch: app.fetch, scheduled };
