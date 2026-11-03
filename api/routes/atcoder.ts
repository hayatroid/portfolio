import { Hono } from "hono";

import type { Bindings } from "../index";

const user = "hayatroid";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => c.json(await c.env.ATCODER.get(user, "json")));

export default app;
