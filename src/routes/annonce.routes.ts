import { Router } from "express";
import * as annonceController from "../controllers/annonce.controllers";

const router = Router();

router.post("/", annonceController.createAnnonce);
router.get("/", annonceController.getAllAnnonces);
router.get("/:id", annonceController.getAnnonceById);
router.put("/:id", annonceController.updateAnnonce);
router.delete("/:id", annonceController.deleteAnnonce);

export default router;
