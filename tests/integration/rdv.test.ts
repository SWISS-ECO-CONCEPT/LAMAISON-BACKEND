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

describe("Rendez-vous API", () => {
  let agentA: { id: number; clerkId: string };
  let agentB: { id: number; clerkId: string };
  let prospectA: { id: number; clerkId: string };
  let prospectB: { id: number; clerkId: string };
  let annonceId: number;
  let rdvId: number;

  beforeEach(async () => {
    await cleanDatabase();
    await prisma.rendezVous.deleteMany();
    await prisma.annonce.deleteMany();
    await prisma.user.deleteMany();

    agentA = await prisma.user.create({ data: { clerkId: "clerk_agent_a", firstname: "AgentA", role: "AGENT" } });
    agentB = await prisma.user.create({ data: { clerkId: "clerk_agent_b", firstname: "AgentB", role: "AGENT" } });
    prospectA = await prisma.user.create({ data: { clerkId: "clerk_prospect_a", firstname: "ProspectA", role: "PROSPECT" } });
    prospectB = await prisma.user.create({ data: { clerkId: "clerk_prospect_b", firstname: "ProspectB", role: "PROSPECT" } });

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

    const rdv = await prisma.rendezVous.create({
      data: {
        date: new Date("2026-12-01T10:00:00Z"),
        nom: "Dupont",
        prenom: "Jean",
        email: "jean@example.com",
        telephone: "0123456789",
        message: "Je souhaite visiter",
        status: "EN_ATTENTE",
        prospect: { connect: { id: prospectA.id } },
        annonce: { connect: { id: annonceId } },
      },
    });
    rdvId = rdv.id;
  });

  afterAll(async () => {
      afterAll(async () => {
            await cleanDatabase();
            await prisma.$disconnect();
        });
  });

  describe("GET /api/v1/rdvs", () => {
    it("refuse sans authentification (route était publique avant l'audit sécurité)", async () => {
      const res = await request(app).get("/api/v1/rdvs");
      expect(res.status).toBe(401);
    });

    it("liste les RDV pour un utilisateur authentifié", async () => {
      const res = await request(app)
        .get("/api/v1/rdvs")
        .set("x-test-clerk-user-id", agentA.clerkId);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/v1/rdvs/:id", () => {
    it("refuse sans authentification", async () => {
      const res = await request(app).get(`/api/v1/rdvs/${rdvId}`);
      expect(res.status).toBe(401);
    });

    it("renvoie le RDV pour un utilisateur authentifié", async () => {
      const res = await request(app)
        .get(`/api/v1/rdvs/${rdvId}`)
        .set("x-test-clerk-user-id", prospectA.clerkId);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(rdvId);
    });
  });

  describe("DELETE /api/v1/rdvs/:id — IDOR (faille corrigée par l'audit sécurité)", () => {
    it("refuse la suppression par un prospect qui ne participe pas au RDV", async () => {
      const res = await request(app)
        .delete(`/api/v1/rdvs/${rdvId}`)
        .set("x-test-clerk-user-id", prospectB.clerkId);

      expect(res.status).toBe(500); // le service jette une erreur générique, remontée en 500 par le controller
      const stillThere = await prisma.rendezVous.findUnique({ where: { id: rdvId } });
      expect(stillThere).not.toBeNull(); // surtout : le RDV n'a PAS été supprimé
    });

    it("refuse la suppression par un agent qui n'est pas propriétaire de l'annonce concernée", async () => {
      const res = await request(app)
        .delete(`/api/v1/rdvs/${rdvId}`)
        .set("x-test-clerk-user-id", agentB.clerkId);

      expect(res.status).toBe(500);
      const stillThere = await prisma.rendezVous.findUnique({ where: { id: rdvId } });
      expect(stillThere).not.toBeNull();
    });

    it("autorise la suppression par le prospect concerné", async () => {
      const res = await request(app)
        .delete(`/api/v1/rdvs/${rdvId}`)
        .set("x-test-clerk-user-id", prospectA.clerkId);

      expect(res.status).toBe(200);
      const gone = await prisma.rendezVous.findUnique({ where: { id: rdvId } });
      expect(gone).toBeNull();
    });

    it("autorise la suppression par l'agent propriétaire de l'annonce", async () => {
      const res = await request(app)
        .delete(`/api/v1/rdvs/${rdvId}`)
        .set("x-test-clerk-user-id", agentA.clerkId);

      expect(res.status).toBe(200);
      const gone = await prisma.rendezVous.findUnique({ where: { id: rdvId } });
      expect(gone).toBeNull();
    });
  });

  describe("POST /api/v1/rdvs/:id/accept — contrôle de rôle", () => {
    it("refuse qu'un prospect accepte un RDV (seul l'agent peut)", async () => {
      const res = await request(app)
        .post(`/api/v1/rdvs/${rdvId}/accept`)
        .set("x-test-clerk-user-id", prospectA.clerkId);

      expect(res.status).toBe(500);
      const unchanged = await prisma.rendezVous.findUnique({ where: { id: rdvId } });
      expect(unchanged?.status).toBe("EN_ATTENTE");
    });

    it("refuse qu'un agent qui n'est pas propriétaire de l'annonce accepte le RDV", async () => {
      const res = await request(app)
        .post(`/api/v1/rdvs/${rdvId}/accept`)
        .set("x-test-clerk-user-id", agentB.clerkId);

      expect(res.status).toBe(500);
    });

    it("l'agent propriétaire peut accepter le RDV", async () => {
      const res = await request(app)
        .post(`/api/v1/rdvs/${rdvId}/accept`)
        .set("x-test-clerk-user-id", agentA.clerkId);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("ACCEPTE");
    });
  });

  describe("POST /api/v1/rdvs/:id/proposal/accept — contrôle de rôle inverse", () => {
    it("refuse qu'un agent accepte sa propre proposition (seul le prospect peut)", async () => {
      // L'agent propose d'abord un nouveau créneau
      await request(app)
        .post(`/api/v1/rdvs/${rdvId}/propose`)
        .set("x-test-clerk-user-id", agentA.clerkId)
        .send({ proposedDate: "2026-12-05T14:00:00Z" });

      const res = await request(app)
        .post(`/api/v1/rdvs/${rdvId}/proposal/accept`)
        .set("x-test-clerk-user-id", agentA.clerkId);

      expect(res.status).toBe(500);
    });

    it("le prospect concerné peut accepter la proposition de l'agent", async () => {
      await request(app)
        .post(`/api/v1/rdvs/${rdvId}/propose`)
        .set("x-test-clerk-user-id", agentA.clerkId)
        .send({ proposedDate: "2026-12-05T14:00:00Z" });

      const res = await request(app)
        .post(`/api/v1/rdvs/${rdvId}/proposal/accept`)
        .set("x-test-clerk-user-id", prospectA.clerkId);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("ACCEPTE");
    });
  });
});