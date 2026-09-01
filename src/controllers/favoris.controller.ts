import { Request, Response } from "express";
import { favoriService } from "../services/favoris.service";
import { CreateFavoriDTO } from "../dto/favoris.dto";
import { getDbUserIdByClerkId } from "../services/auth.services";

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
      return res.status(400).json({ message: 'clerkId parameter is required in the route.' });
    }
    if (!assertIsOwnClerkId(req, clerkId)) {
      return res.status(403).json({ message: "Vous ne pouvez modifier que vos propres favoris." });
    }
    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    const data: CreateFavoriDTO = req.body;
    const favori = await favoriService.createFavori(Number(dbUserId), data);
    res.status(201).json(favori);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les favoris d'un user
export const getUserFavoris = async (req: Request, res: Response) => {
  try {
    const clerkId = req.params.clerkId as string | undefined;
    if (!clerkId) {
      return res.status(400).json({ message: 'clerkId parameter is required in the route.' });
    }
    if (!assertIsOwnClerkId(req, clerkId)) {
      return res.status(403).json({ message: "Vous ne pouvez consulter que vos propres favoris." });
    }
    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    const favoris = await favoriService.getUserFavoris(Number(dbUserId));
    res.json(favoris);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un favori
export const deleteFavori = async (req: Request, res: Response) => {
  try {
    const clerkId = req.params.clerkId as string | undefined;
    if (!clerkId) {
      return res.status(400).json({ message: 'clerkId parameter is required in the route.' });
    }
    if (!assertIsOwnClerkId(req, clerkId)) {
      return res.status(403).json({ message: "Vous ne pouvez supprimer que vos propres favoris." });
    }
    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    const annonceId = parseInt(req.params.annonceId);
    const favori = await favoriService.deleteFavori(Number(dbUserId), annonceId);
    res.json(favori);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};