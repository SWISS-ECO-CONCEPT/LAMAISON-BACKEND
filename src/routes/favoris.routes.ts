import { Router } from "express";
import * as FavorisController from "../controllers/favoris.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

router.post("/:clerkId", FavorisController.createFavori);
router.delete("/:annonceId/:clerkId", FavorisController.deleteFavori);
router.get("/:clerkId", FavorisController.getUserFavoris);

export default router;
