import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import connectDB from "./db/connect";
import dbConnect from "./db/connect";
const app = new Hono();

app.use(poweredBy());
app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

(async () => {
  await connectDB();

  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  });
})();

export default app;
