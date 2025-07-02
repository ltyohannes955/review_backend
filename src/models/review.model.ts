import { model, Schema, Types } from "mongoose";

export interface IReview {
  rating: number;
  comment: string;
  user: Types.ObjectId;
  institution: Types.ObjectId;
  images: string[];
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    images: [{ type: String }]
  },
  { timestamps: true }
);

export default model("Review", ReviewSchema);
