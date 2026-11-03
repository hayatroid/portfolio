import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text(c.req.header("CF-Connecting-IP") ?? "Oops!"));

export default app;
