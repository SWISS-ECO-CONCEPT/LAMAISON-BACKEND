import { Request, Response } from "express";
import { favoriService } from "../services/favoris.service";
import { CreateFavoriDTO } from "../dto/favoris.dto";
import { getDbUserIdByClerkId } from "../services/auth.services";
import { sendSuccess, sendError } from "../utils/apiResponse";

// Petite fonction réutilisée dans les 3 contrôleurs ci-dessous : compare le clerkId
// pris dans l'URL avec le VRAI clerkId de la personne connectée (celui que Clerk a
// vérifié via le token, disponible dans req.auth().userId). Si ça ne correspond pas,
// quelqu'un essaie d'agir sur les favoris de quelqu'un d'autre — on refuse.
function assertIsOwnClerkId(req: Request, clerkId: string): boolean {
  const auth = req.auth();
  return !!auth?.userId && auth.userId === clerkId;
}

// Ajouter un favori
export const createFavori = async (req: Request, res: Response) => {
  try {
    const clerkId = req.params.clerkId as string | undefined;
    if (!clerkId) {
      return sendError(res, 400, "clerkId parameter is required in the route.");
    }
    if (!assertIsOwnClerkId(req, clerkId)) {
      return sendError(res, 403, "Vous ne pouvez modifier que vos propres favoris.");
    }
    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId) {
      return sendError(res, 404, "Utilisateur introuvable");
    }
    const data: CreateFavoriDTO = req.body;
    const favori = await favoriService.createFavori(Number(dbUserId), data);
    return sendSuccess(res, favori, 201);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

// Récupérer tous les favoris d'un user
export const getUserFavoris = async (req: Request, res: Response) => {
  try {
    const clerkId = req.params.clerkId as string | undefined;
    if (!clerkId) {
      return sendError(res, 400, "clerkId parameter is required in the route.");
    }
    if (!assertIsOwnClerkId(req, clerkId)) {
      return sendError(res, 403, "Vous ne pouvez consulter que vos propres favoris.");
    }
    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId) {
      return sendError(res, 404, "Utilisateur introuvable");
    }
    const favoris = await favoriService.getUserFavoris(Number(dbUserId));
    return sendSuccess(res, favoris, 200);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

// Supprimer un favori
export const deleteFavori = async (req: Request, res: Response) => {
  try {
    const annonceIdParam = req.params.annonceId as string | undefined;
    if (!annonceIdParam) {
      return sendError(res, 400, "annonceId parameter is required in the route.");
    }
    const clerkId = req.params.clerkId as string | undefined;
    if (!clerkId) {
      return sendError(res, 400, "clerkId parameter is required in the route.");
    }
    if (!assertIsOwnClerkId(req, clerkId)) {
      return sendError(res, 403, "Vous ne pouvez supprimer que vos propres favoris.");
    }
    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId) {
      return sendError(res, 404, "Utilisateur introuvable");
    }
    const annonceId = parseInt(annonceIdParam, 10);
    if (isNaN(annonceId)) {
      return sendError(res, 400, "annonceId doit être un nombre entier valide.");
    }
    const favori = await favoriService.deleteFavori(Number(dbUserId), annonceId);
    return sendSuccess(res, favori, 200);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};