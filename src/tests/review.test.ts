import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import app from "../index";
import mongoose from "mongoose";
import User from "../models/user.model";
import Institution from "../models/institution.model";
import Review from "../models/review.model";
import { MongoMemoryServer } from "mongodb-memory-server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

let mongo: MongoMemoryServer;
describe("Review Routes", () => {
  let authToken: string;
  let userId: string;
  let institutionId: string;
  let reviewId: string;

  beforeAll(async () => {
    // Connect to test DB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);

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
    userId = userData.user.id;

    // Create test institution
    const institutionResponse = await app.request("/institutions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: "Test Institution",
        description: "Test Description",
        location: "Test Location",
      }),
    });
    const institutionData = await institutionResponse.json();
    institutionId = institutionData._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
  });

  describe("POST /reviews", () => {
    it("should create a new review", async () => {
      const response = await app.request("/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          rating: 5,
          comment: "Great institution!",
          institution: institutionId,
        }),
      });

      const data = await response.json();
      reviewId = data._id;
      expect(response.status).toBe(201);
      expect(data.rating).toBe(5);
      expect(data.comment).toBe("Great institution!");
      expect(data.user.toString()).toBe(userId);
      expect(data.institution.toString()).toBe(institutionId);
    });
  });

  describe("GET /reviews/institution/:institutionId", () => {
    it("should get reviews by institution", async () => {
      const response = await app.request(
        `/reviews/institution/${institutionId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].institution.toString()).toBe(institutionId);
    });

    it("should return 400 for invalid institution ID", async () => {
      const response = await app.request("/reviews/institution/invalid-id", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      expect(response.status).toBe(400);
    });
  });

  describe("GET /reviews/user/:userId", () => {
    it("should get reviews by user", async () => {
      const response = await app.request(`/reviews/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].user.toString()).toBe(userId);
    });

    it("should return 400 for invalid user ID", async () => {
      const response = await app.request("/reviews/user/invalid-id", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /reviews/:id", () => {
    it("should update a review", async () => {
      const response = await app.request(`/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          rating: 4,
          comment: "Updated review",
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.rating).toBe(4);
      expect(data.comment).toBe("Updated review");
    });
  });

  describe("DELETE /reviews/:id", () => {
    it("should delete a review", async () => {
      const response = await app.request(`/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.message).toBe("Review deleted successfully");
    });
  });
});
