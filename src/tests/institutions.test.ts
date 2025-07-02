import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import app from "../index";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

let mongo: MongoMemoryServer;

describe("Institution Routes", () => {
  let authToken: string;
  let userId: string;
  let institutionId: string;

  beforeAll(async () => {
    // Set up test MongoDB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    // Register user and get token
    const userResponse = await app.request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    });

    const userData = await userResponse.json();
    authToken = userData.token;
    const decoded: any = jwt.verify(authToken, JWT_SECRET);
    userId = decoded.id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  // ---------- POST ----------
  describe("POST /institutions", () => {
    it("should create an institution with images", async () => {
      const imageBlob = new Blob(["test image content"], {
        type: "image/jpeg",
      });
      const imageFile = new File([imageBlob], "test.jpg", {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("name", "Test University");
      formData.append("description", "University for testing.");
      formData.append("location", "Test City");
      formData.append("images", imageFile);

      const response = await app.request("/institutions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await response.json();
      institutionId = data._id; // Capture for later tests

      expect(response.status).toBe(201);
      expect(data.name).toBe("Test University");
      expect(data.addedBy).toBe(userId);
      expect(Array.isArray(data.images)).toBe(true);
    });

    it("should return 401 Unauthorized if no token is provided", async () => {
      const formData = new FormData();
      formData.append("name", "Unauthorized Institution");
      formData.append("description", "Should fail");
      formData.append("location", "NoTokenCity");

      const response = await app.request("/institutions", {
        method: "POST",
        body: formData,
      });

      expect(response.status).toBe(401);
    });
  });

  // ---------- GET ----------
  describe("GET /institutions", () => {
    it("should retrieve all institutions", async () => {
      const response = await app.request("/institutions");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /institutions/:id", () => {
    it("should get a single institution by id", async () => {
      if (!institutionId) throw new Error("institutionId not set");

      const response = await app.request(`/institutions/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.name).toBe("Test University");
    });

    it("should return 400 for invalid ID", async () => {
      const response = await app.request("/institutions/invalid-id", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(400);
    });

    it("should return 404 for non-existent institution", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.request(`/institutions/${fakeId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(404);
    });
  });

  // ---------- PATCH ----------
  describe("PATCH /institutions/:id", () => {
    it("should update institution name", async () => {
      if (!institutionId) throw new Error("institutionId not set");

      const response = await app.request(`/institutions/${institutionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Updated University",
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.name).toBe("Updated University");
    });

    it("should update institution with new images", async () => {
      if (!institutionId) throw new Error("institutionId not set");

      const imageBlob = new Blob(["updated image"], { type: "image/jpeg" });
      const imageFile = new File([imageBlob], "updated.jpg", {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("name", "Updated University Again");
      formData.append("images", imageFile);

      const response = await app.request(`/institutions/${institutionId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.name).toBe("Updated University Again");
      expect(Array.isArray(data.images)).toBe(true);
    });
  });

  // ---------- DELETE ----------
  describe("DELETE /institutions/:id", () => {
    it("should delete institution successfully", async () => {
      if (!institutionId) throw new Error("institutionId not set");

      const response = await app.request(`/institutions/${institutionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.message).toBe("Institution deleted successfully");
    });

    it("should return 404 when deleting non-existent institution", async () => {
      const response = await app.request(`/institutions/${institutionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(404);
    });
  });
});
