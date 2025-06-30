import { Hono } from "hono";
import { register, login, getProfile } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = new Hono();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

export default router;
