import { createMiddleware } from "hono/factory";

import type { Bindings } from "../index";

export default createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
  const { "cf-turnstile-response": response } = await c.req.parseBody<{ "cf-turnstile-response": string }>();
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: c.env.TURNSTILE_SECRET, response }),
  });
  const { success } = await res.json<{ success: boolean }>();
  if (!success) return c.text("Verify you are human", 403);
  await next();
});
