import { Request, Response, NextFunction } from "express";
import { isAuthenticated } from "./auth.middleware";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // D'abord vérifier si l'utilisateur est authentifié
  isAuthenticated(req, res, (err) => {
    if (err) return; // isAuthenticated gère déjà la réponse d'erreur
    
    // Vérifier si l'utilisateur a le rôle d'administrateur
    if (req.user && req.user.role === 'admin') {
      next(); // L'utilisateur est un admin, continuer
    } else {
      return res.status(403).json({ error: "Accès non autorisé - Administrateur requis" });
    }
  });
};
