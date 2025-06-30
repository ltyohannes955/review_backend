import { Context } from "hono";
import User from "../models/user.model";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const register = async (c: Context) => {
  try {
    const { name, email, password, DateOfBirth } = await c.req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      DateOfBirth,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, verified: user.verified },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json(
      {
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified,
        },
      },
      201
    );
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, verified: user.verified },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const getProfile = async (c: Context) => {
  try {
    const userId = c.get("userId");
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};
