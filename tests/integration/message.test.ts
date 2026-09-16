import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (req: any, _res: any, next: any) => next(),
  requireAuth: () => (req: any, res: any, next: any) => {
    const testUserId = req.headers["x-test-clerk-user-id"];
    if (!testUserId) {
      return res.status(401).json({ success: false, error: { message: "Non authentifié" } });
    }
    req.auth = () => ({ userId: testUserId });
    next();
  },
}));

import app from "../../src/app";
import { prisma, cleanDatabase } from "../helpers/db";

describe("Messages API", () => {
  let userA: { id: number; clerkId: string };
  let userB: { id: number; clerkId: string };
  let userC: { id: number; clerkId: string };

  beforeEach(async () => {
    await cleanDatabase();

    userA = await prisma.user.create({ data: { clerkId: "clerk_user_a", firstname: "Alice", role: "PROSPECT" } });
    userB = await prisma.user.create({ data: { clerkId: "clerk_user_b", firstname: "Bob", role: "AGENT" } });
    userC = await prisma.user.create({ data: { clerkId: "clerk_user_c", firstname: "Carol", role: "PROSPECT" } });
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("POST /api/v1/messages", () => {
    it("refuse sans authentification", async () => {
      const res = await request(app)
        .post("/api/v1/messages")
        .send({ senderId: userA.id, receiverId: userB.id, content: "Bonjour" });

      expect(res.status).toBe(401);
    });

    it("refuse si senderId ne correspond pas à l'utilisateur connecté (usurpation)", async () => {
      const res = await request(app)
        .post("/api/v1/messages")
        .set("x-test-clerk-user-id", userA.clerkId)
        .send({ senderId: userB.id, receiverId: userC.id, content: "Message au nom de Bob" });

      expect(res.status).toBe(403);
    });

    it("envoie le message quand senderId correspond à l'utilisateur connecté", async () => {
      const res = await request(app)
        .post("/api/v1/messages")
        .set("x-test-clerk-user-id", userA.clerkId)
        .send({ senderId: userA.id, receiverId: userB.id, content: "Bonjour Bob" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe("Bonjour Bob");
    });
  });

  describe("GET /api/v1/messages/:userId1/:userId2", () => {
    beforeEach(async () => {
      await prisma.message.create({ data: { senderId: userA.id, receiverId: userB.id, content: "Salut" } });
    });

    it("refuse sans authentification", async () => {
      const res = await request(app).get(`/api/v1/messages/${userA.id}/${userB.id}`);
      expect(res.status).toBe(401);
    });

    it("refuse si l'appelant ne participe pas à la conversation", async () => {
      const res = await request(app)
        .get(`/api/v1/messages/${userA.id}/${userB.id}`)
        .set("x-test-clerk-user-id", userC.clerkId);

      expect(res.status).toBe(403);
    });

    it("renvoie la conversation pour l'un des deux participants", async () => {
      const res = await request(app)
        .get(`/api/v1/messages/${userA.id}/${userB.id}`)
        .set("x-test-clerk-user-id", userB.clerkId);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].content).toBe("Salut");
    });
  });

  describe("GET /api/v1/messages/conversation", () => {
    it("refuse sans authentification", async () => {
      const res = await request(app)
        .get("/api/v1/messages/conversation")
        .query({ prospectClerkId: userA.clerkId, agentClerkId: userB.clerkId });

      expect(res.status).toBe(401);
    });

    it("refuse si l'appelant n'est ni le prospect ni l'agent concerné", async () => {
      const res = await request(app)
        .get("/api/v1/messages/conversation")
        .query({ prospectClerkId: userA.clerkId, agentClerkId: userB.clerkId })
        .set("x-test-clerk-user-id", userC.clerkId);

      expect(res.status).toBe(403);
    });

    it("renvoie la conversation pour l'un des deux participants", async () => {
      const res = await request(app)
        .get("/api/v1/messages/conversation")
        .query({ prospectClerkId: userA.clerkId, agentClerkId: userB.clerkId })
        .set("x-test-clerk-user-id", userA.clerkId);

      expect(res.status).toBe(200);
      expect(res.body.data.senderId).toBe(userA.id);
      expect(res.body.data.receiverId).toBe(userB.id);
    });
  });

  describe("GET /api/v1/messages — liste des conversations", () => {
    it("refuse sans authentification", async () => {
      const res = await request(app).get("/api/v1/messages");
      expect(res.status).toBe(401);
    });

    it("renvoie les conversations de l'utilisateur connecté", async () => {
      await prisma.message.create({ data: { senderId: userA.id, receiverId: userB.id, content: "Salut Bob" } });

      const res = await request(app)
        .get("/api/v1/messages")
        .set("x-test-clerk-user-id", userA.clerkId);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].otherUser.clerkId).toBe(userB.clerkId);
    });
  });

  describe("POST /api/v1/messages/initiate", () => {
    it("refuse sans authentification", async () => {
      const res = await request(app)
        .post("/api/v1/messages/initiate")
        .send({ recipientClerkId: userB.clerkId, initialMessage: "Bonjour" });

      expect(res.status).toBe(401);
    });

    it("crée la conversation et le premier message", async () => {
      const res = await request(app)
        .post("/api/v1/messages/initiate")
        .set("x-test-clerk-user-id", userA.clerkId)
        .send({ recipientClerkId: userB.clerkId, initialMessage: "Bonjour Bob, à bientôt" });

      expect(res.status).toBe(201);
      expect(res.body.data.message.content).toBe("Bonjour Bob, à bientôt");
      expect(res.body.data.conversation.senderId).toBe(userA.id);
      expect(res.body.data.conversation.receiverId).toBe(userB.id);
    });
  });
});