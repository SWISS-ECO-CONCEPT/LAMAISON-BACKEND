import { describe, it, expect, vi, beforeEach } from "vitest";

// On remplace complètement Prisma par des fonctions contrôlables : ce test
// ne touche AUCUNE vraie base de données, contrairement aux tests
// d'intégration. Objectif : vérifier uniquement la logique métier pure
// (qui a le droit de faire quelle transition d'état) rapidement et de façon
// isolée — si ça échoue, le problème est forcément dans rdv.service.ts,
// jamais dans la config Prisma/MySQL.
vi.mock("../../src/utils/db", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    rendezVous: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

import { prisma } from "../../src/utils/db";
import * as rdvService from "../../src/services/rdv.service";

const mockUser = (overrides: Partial<{ id: number; role: string }> = {}) => ({
  id: 1,
  clerkId: "clerk_test",
  role: "AGENT",
  ...overrides,
});

const mockRdv = (overrides: any = {}) => ({
  id: 10,
  status: "EN_ATTENTE",
  proposedDate: null,
  prospectId: 2,
  annonce: { proprietaireId: 1 },
  ...overrides,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("proposeRdv", () => {
  it("refuse si l'acteur n'est pas un agent", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ role: "PROSPECT" }));

    await expect(rdvService.proposeRdv(10, "clerk_test", new Date())).rejects.toThrow(
      "Seul un agent peut proposer un créneau"
    );
  });

  it("refuse si l'agent n'est pas propriétaire de l'annonce concernée", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ id: 999, role: "AGENT" }));
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ annonce: { proprietaireId: 1 } }));

    await expect(rdvService.proposeRdv(10, "clerk_test", new Date())).rejects.toThrow(
      "Accès refusé: vous n'êtes pas l'agent de ce RDV"
    );
  });

  it("refuse une transition depuis un statut ACCEPTE", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser());
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ status: "ACCEPTE" }));

    await expect(rdvService.proposeRdv(10, "clerk_test", new Date())).rejects.toThrow("Transition invalide");
  });

  it("autorise la proposition quand l'agent est propriétaire et le statut valide", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser());
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ status: "EN_ATTENTE" }));
    (prisma.rendezVous.update as any).mockResolvedValue({ id: 10, status: "PROPOSE" });

    const proposedDate = new Date("2026-12-01T10:00:00Z");
    await rdvService.proposeRdv(10, "clerk_test", proposedDate);

    expect(prisma.rendezVous.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({ status: "PROPOSE", proposedDate }),
      })
    );
  });
});

describe("acceptRdv", () => {
  it("refuse si l'acteur n'est pas un agent", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ role: "PROSPECT" }));

    await expect(rdvService.acceptRdv(10, "clerk_test")).rejects.toThrow("Seul un agent peut accepter un RDV");
  });

  it("refuse si le statut n'est pas EN_ATTENTE", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser());
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ status: "PROPOSE" }));

    await expect(rdvService.acceptRdv(10, "clerk_test")).rejects.toThrow("Transition invalide");
  });

  it("accepte et efface proposedDate quand tout est valide", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser());
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ status: "EN_ATTENTE" }));
    (prisma.rendezVous.update as any).mockResolvedValue({ id: 10, status: "ACCEPTE" });

    await rdvService.acceptRdv(10, "clerk_test");

    expect(prisma.rendezVous.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ACCEPTE", proposedDate: null }),
      })
    );
  });
});

describe("acceptProposal", () => {
  it("refuse si l'acteur n'est pas un prospect", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ role: "AGENT" }));

    await expect(rdvService.acceptProposal(10, "clerk_test")).rejects.toThrow(
      "Seul un prospect peut valider une proposition"
    );
  });

  it("refuse si le prospect n'est pas celui du RDV", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ id: 999, role: "PROSPECT" }));
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ prospectId: 2, status: "PROPOSE", proposedDate: new Date() }));

    await expect(rdvService.acceptProposal(10, "clerk_test")).rejects.toThrow(
      "Accès refusé: vous n'êtes pas le prospect de ce RDV"
    );
  });

  it("refuse s'il n'y a pas de proposedDate même si le statut est PROPOSE", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ id: 2, role: "PROSPECT" }));
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ prospectId: 2, status: "PROPOSE", proposedDate: null }));

    await expect(rdvService.acceptProposal(10, "clerk_test")).rejects.toThrow("Transition invalide");
  });

  it("accepte la proposition et bascule date <- proposedDate", async () => {
    const proposedDate = new Date("2026-12-05T14:00:00Z");
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ id: 2, role: "PROSPECT" }));
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ prospectId: 2, status: "PROPOSE", proposedDate }));
    (prisma.rendezVous.update as any).mockResolvedValue({ id: 10, status: "ACCEPTE" });

    await rdvService.acceptProposal(10, "clerk_test");

    expect(prisma.rendezVous.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ACCEPTE", date: proposedDate, proposedDate: null }),
      })
    );
  });
});

describe("deleteRdv", () => {
  it("refuse si l'acteur n'est ni l'agent ni le prospect du RDV", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ id: 999 }));
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ annonce: { proprietaireId: 1 }, prospectId: 2 }));

    await expect(rdvService.deleteRdv(10, "clerk_test")).rejects.toThrow(
      "Accès refusé: vous ne participez pas à ce rendez-vous"
    );
  });

  it("autorise la suppression par l'agent propriétaire", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ id: 1 }));
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ annonce: { proprietaireId: 1 }, prospectId: 2 }));
    (prisma.rendezVous.delete as any).mockResolvedValue({ id: 10 });

    await rdvService.deleteRdv(10, "clerk_test");

    expect(prisma.rendezVous.delete).toHaveBeenCalledWith({ where: { id: 10 } });
  });

  it("autorise la suppression par le prospect concerné", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser({ id: 2, role: "PROSPECT" }));
    (prisma.rendezVous.findUnique as any).mockResolvedValue(mockRdv({ annonce: { proprietaireId: 1 }, prospectId: 2 }));
    (prisma.rendezVous.delete as any).mockResolvedValue({ id: 10 });

    await rdvService.deleteRdv(10, "clerk_test");

    expect(prisma.rendezVous.delete).toHaveBeenCalledWith({ where: { id: 10 } });
  });
});