// src/types/express.d.ts
import type { Role } from "@prisma/client"; // si tu utilises Prisma (sinon, remplace par ton union de rôles)

declare global {
  namespace Express {
    // Le payload minimal que tu veux attacher à req.user
    interface AuthUser {
      id: number;                 // ou string selon ta DB/JWT
      role: Role | "PROSPECT" | "AGENT" | "ADMIN";
      email?: string;
    }

    interface Request {
      user?: AuthUser;           // <-- On ajoute user sur Request
    }
  }
}

// IMPORTANT : force ce fichier à être traité comme module
export {};
