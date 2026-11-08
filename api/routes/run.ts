import { Hono } from "hono";

import type { Bindings } from "../index";
import turnstile from "../middlewares/turnstile";

const app = new Hono<{ Bindings: Bindings }>();

app.post("/", turnstile, async (c) => {
  const { lang, code, stdin } = await c.req.parseBody<{ lang: string; code: string; stdin: string }>();
  return c.json(await c.env.SANDBOX.getByName("sandbox").run(lang, code, stdin));
});

export default app;
