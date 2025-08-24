import { Router } from "express";
import { FavorisController } from "../controllers/favoris.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", isAuthenticated, FavorisController.addFavori);
router.delete("/:annonceId", isAuthenticated, FavorisController.removeFavori);
router.get("/", isAuthenticated, FavorisController.getFavoris);

export default router;
