import { Context } from "hono";
import Review from "../models/review.model";
import mongoose from "mongoose";

export const createReview = async (c: Context) => {
  try {
    const { rating, comment, institution } = await c.req.json();
    const userId = c.get("userId");

    const review = await Review.create({
      rating,
      comment,
      user: userId,
      institution,
    });

    return c.json(review, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getReviewsByInstitution = async (c: Context) => {
  try {
    const institutionId = c.req.param("institutionId");

    if (!mongoose.Types.ObjectId.isValid(institutionId)) {
      return c.json({ error: "Invalid institution ID" }, 400);
    }

    const reviews = await Review.find({ institution: institutionId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return c.json(reviews);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getReviewsByUser = async (c: Context) => {
  try {
    const userId = c.req.param("userId");

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const reviews = await Review.find({ user: userId })
      .populate("institution", "name location")
      .sort({ createdAt: -1 });

    return c.json(reviews);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateReview = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const { rating, comment } = await c.req.json();
    const userId = c.get("userId");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: "Invalid review ID" }, 400);
    }

    const review = await Review.findOneAndUpdate(
      { _id: id, user: userId },
      { rating, comment },
      { new: true }
    );

    if (!review) {
      return c.json({ error: "Review not found or unauthorized" }, 404);
    }

    return c.json(review);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const deleteReview = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const userId = c.get("userId");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: "Invalid review ID" }, 400);
    }

    const review = await Review.findOneAndDelete({ _id: id, user: userId });

    if (!review) {
      return c.json({ error: "Review not found or unauthorized" }, 404);
    }

    return c.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};