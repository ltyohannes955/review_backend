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

reviewRoutes.use("/*", authMiddleware);
reviewRoutes.post("/", createReview);
reviewRoutes.get("/institution/:institutionId", getReviewsByInstitution);
reviewRoutes.get("/user/:userId", getReviewsByUser);
reviewRoutes.patch("/:id", updateReview);
reviewRoutes.delete("/:id", deleteReview);

export default reviewRoutes;