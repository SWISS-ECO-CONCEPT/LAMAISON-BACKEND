import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError } from "../../src/utils/apiResponse";

// Pas besoin d'un vrai serveur Express ici : sendSuccess/sendError ne font
// qu'appeler res.status(...).json(...), donc un faux "res" avec juste ces
// deux méthodes suffit pour vérifier ce qu'elles reçoivent.
function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("sendSuccess", () => {
  it("renvoie success:true avec les données, status 200 par défaut", () => {
    const res = createMockRes();
    sendSuccess(res, { id: 1, titre: "Annonce" });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1, titre: "Annonce" },
    });
  });

  it("utilise le status personnalisé quand fourni", () => {
    const res = createMockRes();
    sendSuccess(res, { id: 1 }, 201);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("inclut message uniquement quand fourni", () => {
    const res = createMockRes();
    sendSuccess(res, { id: 1 }, 200, "Créé avec succès");

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1 },
      message: "Créé avec succès",
    });
  });

  it("n'ajoute pas la clé message si elle n'est pas fournie", () => {
    const res = createMockRes();
    sendSuccess(res, { id: 1 });

    const bodyEnvoye = res.json.mock.calls[0][0];
    expect(bodyEnvoye).not.toHaveProperty("message");
  });
});

describe("sendError", () => {
  it("renvoie success:false avec le message et le status demandés", () => {
    const res = createMockRes();
    sendError(res, 404, "Annonce non trouvée");

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: "Annonce non trouvée", code: undefined, details: undefined },
    });
  });

  it("inclut code et details quand fournis", () => {
    const res = createMockRes();
    sendError(res, 500, "Erreur serveur", "P2025", { stack: "..." });

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: "Erreur serveur", code: "P2025", details: { stack: "..." } },
    });
  });
});