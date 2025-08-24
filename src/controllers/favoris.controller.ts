import { Request, Response } from "express";
import { FavorisService } from "../services/favoris.service";

export class FavorisController {
  static async addFavori(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }
      const userId = req.user.id;

      const { annonceId } = req.body;

      const favori = await FavorisService.addFavori(userId, { annonceId });
      res.json(favori);
    } catch (err) {
      res.status(400).json({ error: "Impossible d’ajouter aux favoris" });
    }
  }

  static async removeFavori(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }
      const userId = req.user.id;
      const annonceId = parseInt(req.params.annonceId);

      await FavorisService.removeFavori(userId, annonceId);
      res.json({ message: "Favori supprimé" });
    } catch (err) {
      res.status(400).json({ error: "Impossible de supprimer le favori" });
    }
  }

  static async getFavoris(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }
      const userId = req.user.id;
      const favoris = await FavorisService.getFavorisByUser(userId);
      res.json(favoris);
    } catch (err) {
      res.status(400).json({ error: "Impossible de récupérer les favoris" });
    }
  }
}
