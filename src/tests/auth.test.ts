import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import app from "../index";
import mongoose from "mongoose";
import User from "../models/user.model";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;

describe("Auth Routes", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
    // rest of setup
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      // Change routes from:
      // /register to /auth/register
      // /login to /auth/login
      // /profile to /auth/profile

      const res = await app.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      });

      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.message).toBe("User registered successfully");
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe("test@example.com");
    });

    it("should not register user with existing email", async () => {
      const res = await app.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      });

      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toBe("User already exists");
    });
  });

  describe("POST /login", () => {
    it("should login existing user", async () => {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.message).toBe("Login successful");
      expect(data.token).toBeDefined();
    });

    it("should not login with invalid credentials", async () => {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      });

      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe("Invalid credentials");
    });
  });
});
