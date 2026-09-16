import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import app from "../../src/app";
import { prisma, cleanDatabase } from "../helpers/db";

// Le panel admin n'utilise PAS Clerk — c'est un JWT maison signé par
// adminAuth.service.ts (payload { adminId, role }). Pas besoin de mocker
// quoi que ce soit ici : on signe un vrai token avec le même secret que
// .env.test (JWT_SECRET=test-secret-not-for-prod), exactement comme le
// ferait le vrai endpoint /admin/auth/signin.
const JWT_SECRET = process.env.JWT_SECRET as string;

function signAdminToken(adminId: number, role: string) {
  return jwt.sign({ adminId, role }, JWT_SECRET, { expiresIn: "1h" });
}

describe("Admin API", () => {
  let adminId: number;
  let annonceId: number;

  beforeEach(async () => {
    await cleanDatabase();
    await prisma.admin.deleteMany();

    const admin = await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: "admin@lamaison.test",
        password: await bcrypt.hash("motdepasse123", 10),
        role: "ADMIN",
      },
    });
    adminId = admin.id;

    const agent = await prisma.user.create({ data: { clerkId: "clerk_agent", firstname: "Agent", role: "AGENT" } });
    const annonce = await prisma.annonce.create({
      data: {
        titre: "Villa admin test",
        description: "Description",
        prix: 100000,
        ville: "Douala",
        images: ["https://example.com/photo.jpg"],
        proprietaire: { connect: { id: agent.id } },
      },
    });
    annonceId = annonce.id;
  });

  afterAll(async () => {
    await prisma.admin.deleteMany();
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("POST /api/v1/admin/auth/signin", () => {
    it("refuse un mauvais mot de passe", async () => {
      const res = await request(app)
        .post("/api/v1/admin/auth/signin")
        .send({ email: "admin@lamaison.test", password: "mauvais-mdp" });

      expect(res.status).toBe(400);
    });

    it("renvoie un token pour les bons identifiants", async () => {
      const res = await request(app)
        .post("/api/v1/admin/auth/signin")
        .send({ email: "admin@lamaison.test", password: "motdepasse123" });

      expect(res.status).toBe(201);
      expect(res.body.data.token).toBeDefined();
    });
  });

  describe("Le gate isAdmin (faille corrigée par l'audit sécurité : middleware jamais appliqué avant)", () => {
    it("refuse GET /admin/users sans token", async () => {
      const res = await request(app).get("/api/v1/admin/users");
      expect(res.status).toBe(401);
    });

    it("refuse GET /admin/users avec un token dont le rôle n'est pas ADMIN", async () => {
      const token = signAdminToken(adminId, "AGENT");
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it("autorise GET /admin/users avec un vrai token admin", async () => {
      const token = signAdminToken(adminId, "ADMIN");
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("refuse DELETE /admin/annonces/:id sans token", async () => {
      const res = await request(app).delete(`/api/v1/admin/annonces/${annonceId}`);
      expect(res.status).toBe(401);

      const stillThere = await prisma.annonce.findUnique({ where: { id: annonceId } });
      expect(stillThere).not.toBeNull();
    });
  });

  describe("DELETE /api/v1/admin/annonces/:id", () => {
    it("supprime une annonce sans favoris ni RDV liés", async () => {
      const token = signAdminToken(adminId, "ADMIN");
      const res = await request(app)
        .delete(`/api/v1/admin/annonces/${annonceId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      const gone = await prisma.annonce.findUnique({ where: { id: annonceId } });
      expect(gone).toBeNull();
    });

    it("gère la suppression d'une annonce qui a un favori lié", async () => {
      const prospect = await prisma.user.create({ data: { clerkId: "clerk_prospect", firstname: "Prospect", role: "PROSPECT" } });
      await prisma.favori.create({ data: { userId: prospect.id, annonceId } });

      const token = signAdminToken(adminId, "ADMIN");
      const res = await request(app)
        .delete(`/api/v1/admin/annonces/${annonceId}`)
        .set("Authorization", `Bearer ${token}`);

      // Si ce test échoue avec un 500, c'est le bug de contrainte de clé
      // étrangère évoqué plus haut : deleteAnnonceService ne nettoie pas les
      // favoris/RDV liés avant de supprimer l'annonce, contrairement à
      // deleteAnnonce côté client qui le fait.
      expect(res.status).toBe(200);
    });
  });
});