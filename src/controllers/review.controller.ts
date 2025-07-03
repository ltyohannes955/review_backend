import { Context } from "hono";
import Review from "../models/review.model";
import mongoose from "mongoose";
import { uploadImages } from "../utils/upload";

export const createReview = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const userId = c.get("userId");

    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const files = formData.getAll("images");
    const fileArray = files.filter(
      (file) => file instanceof File && file.size > 0
    );

    let imageUrls: string[] = [];
    if (fileArray.length > 0) {
      try {
        imageUrls = await uploadImages(fileArray as File[]);
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return c.json({ error: "Failed to upload images" }, 500);
      }
    }

    const review = await Review.create({
      rating: Number(formData.get("rating")),
      comment: formData.get("comment")?.toString(),
      user: userId,
      institution: formData.get("institution"),
      images: imageUrls,
    });

    return c.json(review, 201);
  } catch (error: any) {
    console.error("Create review error:", error);
    return c.json({ error: error.message }, 400);
  }
};

export const updateReview = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const userId = c.get("userId");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: "Invalid review ID" }, 400);
    }

    const contentType = c.req.header("content-type") || "";
    let imageUrls: string[] = [];
    let fields: Record<string, any> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await c.req.formData();
      const files = formData.getAll("images");
      const validFiles = files.filter(
        (file) => file instanceof File && file.size > 0
      );

      if (validFiles.length > 0) {
        try {
          const newUrls = await uploadImages(validFiles as File[]);
          const review = await Review.findById(id);
          if (!review) return c.json({ error: "Review not found" }, 404);
          imageUrls = [...(review.images || []), ...newUrls];
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return c.json({ error: "Failed to upload images" }, 500);
        }
      }

      fields = {
        ...(formData.get("rating") && {
          rating: Number(formData.get("rating")),
        }),
        ...(formData.get("comment") && {
          comment: formData.get("comment")?.toString(),
        }),
        ...(formData.get("institution") && {
          institution: formData.get("institution")?.toString(),
        }),
      };
    } else if (contentType.includes("application/json")) {
      fields = await c.req.json();
    } else {
      return c.json({ error: "Unsupported content type" }, 400);
    }

    const updatedReview = await Review.findOneAndUpdate(
      { _id: id, user: userId },
      {
        ...fields,
        ...(imageUrls.length > 0 && { images: imageUrls }),
      },
      { new: true }
    );

    if (!updatedReview) {
      return c.json({ error: "Review not found or unauthorized" }, 404);
    }

    return c.json(updatedReview);
  } catch (error: any) {
    console.error("Update review error:", error);
    return c.json({ error: error.message }, 400);
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
