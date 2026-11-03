import puppeteer from "@cloudflare/puppeteer";
import { Hono } from "hono";
import { cache } from "hono/cache";

import type { Bindings } from "../index";

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/:path{.*}index.png",
  cache({ cacheName: "ogp", cacheControl: "public, max-age=86400" }),
  async (c) => {
    const url = new URL(c.req.url);
    url.pathname = c.req.param("path");
    const browser = await puppeteer.launch(c.env.BROWSER);
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 600, height: 315, deviceScaleFactor: 2 });
      const res = await page.goto(url.href, { waitUntil: "networkidle0" });
      if (!res?.ok()) {
        return c.notFound();
      }
      await page.evaluateHandle("document.fonts.ready");
      await page.evaluate("window.scrollTo(0, 32)");
      const png = await page.screenshot();
      return c.body(new Uint8Array(png), 200, { "content-type": "image/png" });
    } finally {
      await browser.close();
    }
  },
);

export default app;
