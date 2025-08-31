import { Request, Response } from "express";
import { favoriService } from "../services/favoris.service";
import { CreateFavoriDTO } from "../dto/favoris.dto";

// Ajouter un favori
export const createFavori = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id; // récupéré du token
    const data: CreateFavoriDTO = req.body;
    const favori = await favoriService.createFavori(userId, data);
    res.status(201).json(favori);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les favoris d’un user
export const getUserFavoris = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const favoris = await favoriService.getUserFavoris(userId);
    res.json(favoris);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un favori
export const deleteFavori = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const favoriId = parseInt(req.params.id);
    const favori = await favoriService.deleteFavori(userId, favoriId);
    res.json(favori);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
