import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";

// On remplace Clerk par un faux middleware contrôlable depuis le test : au lieu
// de valider un vrai token JWT (ce qui demanderait un compte Clerk de test et
// un accès réseau), on lit un header custom "x-test-clerk-user-id" et on simule
// req.auth() avec cette valeur. Objectif : tester NOTRE logique d'autorisation
// (assertIsOwnClerkId) — pas celle de Clerk, qui n'est pas notre code.
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

describe("Favoris API", () => {
    let userA: { id: number; clerkId: string };
    let userB: { id: number; clerkId: string };
    let annonceId: number;

    beforeEach(async () => {
        // Base nettoyée avant chaque test pour ne pas dépendre de l'ordre d'exécution.
        await cleanDatabase();
        await prisma.favori.deleteMany();
        await prisma.annonce.deleteMany();
        await prisma.user.deleteMany();

        userA = await prisma.user.create({
            data: { clerkId: "clerk_user_a", firstname: "Alice", role: "PROSPECT" },
        });
        userB = await prisma.user.create({
            data: { clerkId: "clerk_user_b", firstname: "Bob", role: "PROSPECT" },
        });
        const agent = await prisma.user.create({
            data: { clerkId: "clerk_agent", firstname: "Agent", role: "AGENT" },
        });
        const annonce = await prisma.annonce.create({
            data: {
                titre: "Villa test",
                description: "Description",
                prix: 150000,
                ville: "Douala",
                images: ["https://example.com/photo.jpg"],
                proprietaire: { connect: { id: agent.id } },
            },
        });
        annonceId = annonce.id;
    });

    afterAll(async () => {
        afterAll(async () => {
            await cleanDatabase();
            await prisma.$disconnect();
        });
    });

    describe("POST /api/v1/favoris/:clerkId", () => {
        it("refuse sans authentification", async () => {
            const res = await request(app)
                .post(`/api/v1/favoris/${userA.clerkId}`)
                .send({ annonceId });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("refuse si le clerkId de l'URL n'est pas celui de l'utilisateur connecté (IDOR)", async () => {
            const res = await request(app)
                .post(`/api/v1/favoris/${userA.clerkId}`)
                .set("x-test-clerk-user-id", userB.clerkId) // Bob essaie d'agir au nom d'Alice
                .send({ annonceId });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("crée le favori quand le clerkId correspond à l'utilisateur connecté", async () => {
            const res = await request(app)
                .post(`/api/v1/favoris/${userA.clerkId}`)
                .set("x-test-clerk-user-id", userA.clerkId)
                .send({ annonceId });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.annonceId).toBe(annonceId);

            const inDb = await prisma.favori.findFirst({ where: { userId: userA.id, annonceId } });
            expect(inDb).not.toBeNull();
        });
    });

    describe("GET /api/v1/favoris/:clerkId", () => {
        it("refuse de lire les favoris d'un autre utilisateur", async () => {
            const res = await request(app)
                .get(`/api/v1/favoris/${userA.clerkId}`)
                .set("x-test-clerk-user-id", userB.clerkId);

            expect(res.status).toBe(403);
        });

        it("renvoie la liste des favoris du bon utilisateur", async () => {
            await prisma.favori.create({ data: { userId: userA.id, annonceId } });

            const res = await request(app)
                .get(`/api/v1/favoris/${userA.clerkId}`)
                .set("x-test-clerk-user-id", userA.clerkId);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe("DELETE /api/v1/favoris/:annonceId/:clerkId", () => {
        it("refuse de supprimer le favori d'un autre utilisateur", async () => {
            await prisma.favori.create({ data: { userId: userA.id, annonceId } });

            const res = await request(app)
                .delete(`/api/v1/favoris/${annonceId}/${userA.clerkId}`)
                .set("x-test-clerk-user-id", userB.clerkId);

            expect(res.status).toBe(403);

            const stillThere = await prisma.favori.findFirst({ where: { userId: userA.id, annonceId } });
            expect(stillThere).not.toBeNull(); // le favori n'a pas été supprimé
        });

        it("supprime le favori du bon utilisateur", async () => {
            await prisma.favori.create({ data: { userId: userA.id, annonceId } });

            const res = await request(app)
                .delete(`/api/v1/favoris/${annonceId}/${userA.clerkId}`)
                .set("x-test-clerk-user-id", userA.clerkId);

            expect(res.status).toBe(200);

            const gone = await prisma.favori.findFirst({ where: { userId: userA.id, annonceId } });
            expect(gone).toBeNull();
        });
    });
});