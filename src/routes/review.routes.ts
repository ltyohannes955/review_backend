import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createReview,
  getReviewsByInstitution,
  getReviewsByUser,
  updateReview,
  deleteReview,
} from "../controllers/review.controller";

const reviewRoutes = new Hono();

reviewRoutes.post("/", authMiddleware, createReview);
reviewRoutes.get("/institution/:institutionId", getReviewsByInstitution);
reviewRoutes.get("/user/:userId", authMiddleware, getReviewsByUser);
reviewRoutes.patch("/:id", authMiddleware, updateReview);
reviewRoutes.delete("/:id", authMiddleware, deleteReview);

export default reviewRoutes;
