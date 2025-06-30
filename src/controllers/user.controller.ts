import { Context } from "hono";
import User from "../models/user.model";
import { isValidObjectId } from "mongoose";

export const getAllUsers = async (c: Context) => {
  try {
    const users = await User.find();
    return c.json(users);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const getUserById = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const user = await User.findById(id);
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json(user);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const updateUserById = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid ID" }, 400);

  const data = await c.req.json();
  try {
    const updated = await User.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return c.json({ error: "User not found" }, 404);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const deleteUserById = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return c.json({ error: "User not found" }, 404);
    return c.json({ message: "User deleted successfully" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};
