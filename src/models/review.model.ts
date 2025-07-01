import { model, Schema, Types } from "mongoose";

export interface IReview {
  rating: number;
  comment: string;
  user: Types.ObjectId;
  institution: Types.ObjectId;
}

const ReviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    institution: {
      type: Types.ObjectId,
      ref: "Institution",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Review", ReviewSchema);
