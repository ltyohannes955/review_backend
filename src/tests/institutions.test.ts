import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import app from "../index";
import mongoose from "mongoose";
import User from "../models/user.model";
import Institution from "../models/institution.model";
import * as jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

let mongo: MongoMemoryServer;

describe("Institution Routes", () => {
  let authToken: string;
  let userId: string;
  let institutionId: string;

  beforeAll(async () => {
    // Connect to test DB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
    // rest of setup

    // Register test user to get authToken
    const userResponse = await app.request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Main Test User",
        email: "maintest@example.com",
        password: "password123",
      }),
    });
    const userData = await userResponse.json();
    authToken = userData.token;
    const decoded: any = jwt.verify(authToken, JWT_SECRET);
    userId = decoded.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
  });

  // Create institution test
  describe("POST /institutions", () => {
    it("should create a new institution successfully", async () => {
      const response = await app.request("/institutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Test University",
          description: "A university for testing purposes.",
          location: "Test City", // <-- Add required field 'location'
        }),
      });

      const data = await response.json();
      institutionId = data._id;
      expect(response.status).toBe(201);
      expect(data.name).toBe("Test University");
      expect(data.addedBy).toBe(userId);
    });

    it("should return 401 Unauthorized if no token is provided", async () => {
      const response = await app.request("/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Another University",
          location: "City", // also add location here to avoid validation error
        }),
      });
      expect(response.status).toBe(401);
    });
  });

  // GET all institutions - no auth required by your route setup
  describe("GET /institutions", () => {
    it("should retrieve all institutions", async () => {
      const response = await app.request("/institutions");
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  // GET single institution by id - auth required
  describe("GET /institutions/:id", () => {
    it("should get a single institution by id", async () => {
      const response = await app.request(`/institutions/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.name).toBe("Test University");
    });

    it("should return 400 for an invalid institution ID", async () => {
      const response = await app.request("/institutions/invalid-id", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      expect(response.status).toBe(400);
    });

    it("should return 404 for a non-existent institution ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await app.request(`/institutions/${nonExistentId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      expect(response.status).toBe(404);
    });
  });

  // PATCH institution - auth required
  describe("PATCH /institutions/:id", () => {
    it("should update an institution successfully", async () => {
      const response = await app.request(`/institutions/${institutionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Updated Test University",
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.name).toBe("Updated Test University");
    });
  });

  // DELETE institution - auth required
  describe("DELETE /institutions/:id", () => {
    it("should delete an institution successfully", async () => {
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

    it("should return 404 when trying to delete a non-existent institution", async () => {
      // Try deleting again same id (already deleted)
      const response = await app.request(`/institutions/${institutionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      expect(response.status).toBe(404);
    });
  });
});
