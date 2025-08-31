import { Router } from "express";
import * as FavorisController from "../controllers/favoris.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", isAuthenticated, FavorisController.createFavori);
router.delete("/:annonceId", isAuthenticated, FavorisController.deleteFavori);
router.get("/", isAuthenticated, FavorisController.getUserFavoris);

export default router;
