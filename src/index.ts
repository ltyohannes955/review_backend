import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import connectDB from "./db/connect";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import institutionsRoutes from "./routes/institution.routes";
import { cors } from "hono/cors";
import reviewRoutes from "./routes/review.routes";

const app = new Hono();
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowed = [
        "http://localhost:3000",
        "https://review-ui-pied.vercel.app",
      ];

      if (!origin) return ""; // Handles non-browser requests

      if (allowed.includes(origin)) {
        return origin;
      }

      return "null"; // 👈 safer than an empty string
    },
    credentials: true,
  })
);
app.use(poweredBy());
app.use(logger());

// Mount routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/institutions", institutionsRoutes);
app.route("/reviews", reviewRoutes);

(async () => {
  await connectDB();

  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  });
})();

export default app;
