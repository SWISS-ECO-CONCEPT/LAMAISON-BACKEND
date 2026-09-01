import { Router } from "express";
import * as FavorisController from "../controllers/favoris.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

// requireAuth() sur les 3 routes : sans ça, n'importe qui pouvait ajouter/lire/supprimer
// les favoris de n'importe quel utilisateur juste en connaissant son clerkId.
router.post("/:clerkId", requireAuth(), FavorisController.createFavori);
router.delete("/:annonceId/:clerkId", requireAuth(), FavorisController.deleteFavori);
router.get("/:clerkId", requireAuth(), FavorisController.getUserFavoris);

export default router;