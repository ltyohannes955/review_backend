import { Context } from "hono";
import Institution from "../models/institution.model";
import { isValidObjectId } from "mongoose";

export const createInstitution = async (c: Context) => {
  const data = await c.req.json();

  // Read userId set by authMiddleware
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized - user info missing" }, 401);
  }

  const institutionData = {
    ...data,
    addedBy: userId, // use userId from context
  };

  const institution = new Institution(institutionData);
  try {
    const saved = await institution.save();
    return c.json(saved, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
};

export const getAllInstitutions = async (c: Context) => {
  try {
    const institutions = await Institution.find()
      .populate("addedBy", "name email")
      .populate("owner", "name email");
    return c.json(institutions);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const getInstitutionById = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid Id" }, 400);

  try {
    const institution = await Institution.findById(id)
      .populate("addedBy", "name email")
      .populate("owner", "name email");
    if (!institution) return c.json({ error: "Institution not found" }, 404);
    return c.json(institution);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const updateInstitution = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid Id" }, 400);

  const data = await c.req.json();
  try {
    const updated = await Institution.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updated) return c.json({ error: "Institution not found" }, 404);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const deleteInstitutionById = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const deleted = await Institution.findByIdAndDelete(id);
    if (!deleted) return c.json({ error: "Institution not found" }, 404);
    return c.json({ message: "Institution deleted successfully" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};
