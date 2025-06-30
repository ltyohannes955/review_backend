import { model, Schema } from "mongoose";
import * as bcrypt from "bcryptjs";

export interface IUserSchema {
  name: string;
  email: string;
  password: string;
  verified: boolean;
}

const UserSchema = new Schema<IUserSchema>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default model("User", UserSchema);
