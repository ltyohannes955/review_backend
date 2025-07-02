import { Context } from "hono";
import Institution from "../models/institution.model";
import { isValidObjectId } from "mongoose";
import { uploadImages } from "../utils/upload";

export const createInstitution = async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    const userId = c.get("userId");

    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    // Handle files
    const files = body.images;
    let imageUrls: string[] = [];

    if (files) {
      // Ensure files is always an array
      const fileArray = Array.isArray(files) ? files : [files];

      // Check if files are actually present and are valid File objects
      const validFiles = fileArray.filter(
        (file) => file instanceof File && file.size > 0
      );

      if (validFiles.length > 0) {
        try {
          imageUrls = await uploadImages(validFiles);
          console.log("Uploaded image URLs:", imageUrls); // Debug log
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return c.json({ error: "Failed to upload images" }, 500);
        }
      }
    }

    const institution = await Institution.create({
      name: body.name,
      location: body.location,
      description: body.description,
      addedBy: userId,
      owner: body.owner,
      images: imageUrls,
    });

    return c.json(institution, 201);
  } catch (err: any) {
    console.error("Create institution error:", err);
    return c.json({ error: err.message }, 500);
  }
};

export const updateInstitution = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid Id" }, 400);

  try {
    const contentType = c.req.header("content-type") || "";
    let body: any = {};
    let files: File[] = [];
    let imageUrls: string[] = [];

    if (contentType.includes("application/json")) {
      body = await c.req.json(); // JSON request (e.g., from your test)
    } else if (contentType.includes("multipart/form-data")) {
      body = await c.req.parseBody();
      const uploaded = body.images;

      files = uploaded
        ? Array.isArray(uploaded)
          ? (uploaded as File[])
          : [uploaded as File]
        : [];

      if (files.length > 0) {
        const newUrls = await uploadImages(files);
        const institution = await Institution.findById(id);
        if (!institution)
          return c.json({ error: "Institution not found" }, 404);
        imageUrls = [...(institution.images || []), ...newUrls];
      }
    }

    const updatedInstitution = await Institution.findByIdAndUpdate(
      id,
      {
        ...body,
        ...(imageUrls.length > 0 && { images: imageUrls }),
      },
      { new: true }
    );

    if (!updatedInstitution) {
      return c.json({ error: "Institution not found" }, 404);
    }

    return c.json(updatedInstitution);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
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
