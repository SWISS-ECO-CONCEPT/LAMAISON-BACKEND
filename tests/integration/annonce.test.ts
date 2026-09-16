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

describe("Annonces API", () => {
  let agentA: { id: number; clerkId: string };
  let agentB: { id: number; clerkId: string };
  let annonceId: number;

  beforeEach(async () => {
    await cleanDatabase();

    agentA = await prisma.user.create({ data: { clerkId: "clerk_agent_a", firstname: "AgentA", role: "AGENT" } });
    agentB = await prisma.user.create({ data: { clerkId: "clerk_agent_b", firstname: "AgentB", role: "AGENT" } });

    const annonce = await prisma.annonce.create({
      data: {
        titre: "Villa test",
        description: "Description",
        prix: 150000,
        ville: "Douala",
        images: ["https://example.com/photo.jpg"],
        proprietaire: { connect: { id: agentA.id } },
      },
    });
    annonceId = annonce.id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("Routes publiques (pas d'auth requise)", () => {
    it("GET /api/v1/annonces liste les annonces sans authentification", async () => {
      const res = await request(app).get("/api/v1/annonces");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it("GET /api/v1/annonces/:id renvoie une annonce sans authentification", async () => {
      const res = await request(app).get(`/api/v1/annonces/${annonceId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(annonceId);
    });

    it("GET /api/v1/annonces/:id renvoie 404 pour une annonce inexistante", async () => {
      const res = await request(app).get(`/api/v1/annonces/999999`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/v1/annonces/:clerkId — création", () => {
    const validPayload = {
      titre: "Nouvelle villa",
      description: "Belle vue",
      prix: 200000,
      ville: "Yaoundé",
      images: ["https://example.com/img.jpg"],
    };

    it("refuse sans authentification", async () => {
      const res = await request(app).post(`/api/v1/annonces/${agentA.clerkId}`).send(validPayload);
      expect(res.status).toBe(401);
    });

    it("refuse si le clerkId de l'URL n'est pas celui de l'utilisateur connecté", async () => {
      const res = await request(app)
        .post(`/api/v1/annonces/${agentA.clerkId}`)
        .set("x-test-clerk-user-id", agentB.clerkId)
        .send(validPayload);

      expect(res.status).toBe(403);
    });

    it("crée l'annonce quand le clerkId correspond à l'utilisateur connecté", async () => {
      const res = await request(app)
        .post(`/api/v1/annonces/${agentA.clerkId}`)
        .set("x-test-clerk-user-id", agentA.clerkId)
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.data.titre).toBe(validPayload.titre);
    });
  });

  describe("PUT /api/v1/annonces/:id — modification (faille corrigée)", () => {
    it("refuse la modification par un agent qui n'est pas le propriétaire", async () => {
      const res = await request(app)
        .put(`/api/v1/annonces/${annonceId}`)
        .set("x-test-clerk-user-id", agentB.clerkId)
        .send({ titre: "Titre modifié par un intrus" });

      expect(res.status).toBe(403);

      const unchanged = await prisma.annonce.findUnique({ where: { id: annonceId } });
      expect(unchanged?.titre).toBe("Villa test"); // pas modifié
    });

    it("autorise la modification par le propriétaire", async () => {
      const res = await request(app)
        .put(`/api/v1/annonces/${annonceId}`)
        .set("x-test-clerk-user-id", agentA.clerkId)
        .send({ titre: "Titre modifié par le vrai propriétaire" });

      expect(res.status).toBe(200);
      expect(res.body.data.titre).toBe("Titre modifié par le vrai propriétaire");
    });
  });

  describe("DELETE /api/v1/annonces/:id — suppression (faille corrigée)", () => {
    it("refuse la suppression par un agent qui n'est pas le propriétaire", async () => {
      const res = await request(app)
        .delete(`/api/v1/annonces/${annonceId}`)
        .set("x-test-clerk-user-id", agentB.clerkId);

      expect(res.status).toBe(403);

      const stillThere = await prisma.annonce.findUnique({ where: { id: annonceId } });
      expect(stillThere).not.toBeNull();
    });

    it("autorise la suppression par le propriétaire, avec suppression en cascade des favoris et RDV liés", async () => {
      const prospect = await prisma.user.create({ data: { clerkId: "clerk_prospect", firstname: "Prospect", role: "PROSPECT" } });
      await prisma.favori.create({ data: { userId: prospect.id, annonceId } });
      await prisma.rendezVous.create({
        data: {
          date: new Date("2026-12-01T10:00:00Z"),
          nom: "Test", prenom: "Test", email: "t@example.com", telephone: "0000000000", message: "test",
          prospect: { connect: { id: prospect.id } },
          annonce: { connect: { id: annonceId } },
        },
      });

      const res = await request(app)
        .delete(`/api/v1/annonces/${annonceId}`)
        .set("x-test-clerk-user-id", agentA.clerkId);

      expect(res.status).toBe(200);

      const gone = await prisma.annonce.findUnique({ where: { id: annonceId } });
      expect(gone).toBeNull();

      const favorisRestants = await prisma.favori.findMany({ where: { annonceId } });
      const rdvsRestants = await prisma.rendezVous.findMany({ where: { annonceId } });
      expect(favorisRestants).toHaveLength(0);
      expect(rdvsRestants).toHaveLength(0);
    });
  });
});