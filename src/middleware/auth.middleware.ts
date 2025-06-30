import { Context, Next } from "hono";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Get token from header
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    // Add user info to context
    c.set("userId", decoded.id);
    c.set("userEmail", decoded.email);
    c.set("userRole", decoded.role);

    await next();
  } catch (err) {
    return c.json({ error: "Unauthorized - Invalid token" }, 401);
  }
};
