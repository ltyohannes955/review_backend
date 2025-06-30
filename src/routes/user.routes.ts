import { Hono } from "hono";
import {
  deleteUserById,
  // getAllUsers,
  getUserById,
  updateUserById,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = new Hono();

// router.get("/", getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.patch("/:id", authMiddleware, updateUserById);
router.delete("/:id", authMiddleware, deleteUserById);

export default router;
