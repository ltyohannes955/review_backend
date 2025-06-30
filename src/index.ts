import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import connectDB from "./db/connect";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { cors } from "hono/cors";

const app = new Hono();
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowed = ["http://localhost:3000"];
      return allowed.includes(origin ?? "") ? origin : "";
    },
    credentials: true,
  })
);
app.use(poweredBy());
app.use(logger());

// Mount routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);

(async () => {
  await connectDB();

  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  });
})();

export default app;
