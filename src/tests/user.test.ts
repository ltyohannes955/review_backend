import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import app from "../index";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;

describe("User Routes", () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
    // rest of setup

    // Create a test user and get auth token
    // In the beforeAll function, update the register route:
    const registerRes = await app.request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    });

    const data = await registerRes.json();
    authToken = data.token;
    userId = data.user.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
  });

  describe("GET /users/:id", () => {
    it("should get user by id", async () => {
      const res = await app.request(`/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.email).toBe("test@example.com");
    });

    it("should return 401 without auth token", async () => {
      const res = await app.request(`/users/${userId}`, {
        method: "GET",
      });

      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe("Unauthorized - No token provided");
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update user", async () => {
      const res = await app.request(`/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Updated Name",
        }),
      });

      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.name).toBe("Updated Name");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete user", async () => {
      const res = await app.request(`/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.message).toBe("User deleted successfully");
    });
  });
});
