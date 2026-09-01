import { Router } from "express";
import * as annonceController from "../controllers/annonce.controller";
import { requireAuth } from "@clerk/express"; 
const router = Router();

// Routes publiques (lecture seule)
router.get("/", annonceController.getAllAnnonces);
router.get("/user/:clerkId", annonceController.getAnnoncesByUser);
router.get("/:id", annonceController.getAnnonceById);
router.post("/:id/view", annonceController.incrementAnnonceViews);

// Routes protégées (création, modification, suppression)
// We accept the Clerk user id as a route parameter and map it to our DB id server-side
//
// requireAuth() : exige un token Clerk valide dans la requête. Sans lui, N'IMPORTE QUI
// pouvait créer une annonce en se faisant passer pour n'importe quel utilisateur juste
// en mettant son clerkId dans l'URL — requireAuth() est la première barrière, mais elle
// ne suffit pas à elle seule (voir la vérification supplémentaire dans le contrôleur).
router.post("/:clerkId", requireAuth(), annonceController.createAnnonce);
router.put("/:id", requireAuth(), annonceController.updateAnnonce);
router.delete("/:id", requireAuth(), annonceController.deleteAnnonce);

export default router;


// import { Router } from "express";
// import * as annonceController from "../controllers/annonce.controller";

// const router = Router();

// router.post("/", annonceController.createAnnonce);
// router.get("/", annonceController.getAllAnnonces);
// router.get("/:id", annonceController.getAnnonceById);
// router.put("/:id", annonceController.updateAnnonce);
// router.delete("/:id", annonceController.deleteAnnonce);

// export default router;
