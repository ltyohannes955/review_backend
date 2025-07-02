import { model, Schema, Types } from "mongoose";

export interface IInstitutionSchema {
  name: string;
  location: string;
  description: string;
  owner: Types.ObjectId;
  addedBy: Types.ObjectId;
  images: string[];
}

const InstitutionSchema = new Schema<IInstitutionSchema>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, required: false, ref: "User" },
  addedBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  images: [{ type: String }],
});

export default model("Institution", InstitutionSchema);
