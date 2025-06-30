import mongoose from "mongoose";

export default async function dbConnect() {
  try {
    const uri = process.env.MONGODB_URL;
    if (!uri) throw new Error("MONGODB_URL not set in environment variables");

    await mongoose.connect(uri);
    console.log("✅ mongoDB connected");
  } catch (error) {
    console.error("❌ mongoDB connection failed:", error);
    process.exit(1); // Exit process on failure so server doesn't start
  }
}
