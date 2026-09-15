import { Router } from "express";
import * as annonceController from "../controllers/annonce.controller";
import { requireAuth } from "@clerk/express"; 
const router = Router();

// Routes publiques (lecture seule)

/**
 * @openapi
 * /annonces:
 *   get:
 *     summary: Lister toutes les annonces (avec recherche et filtres)
 *     tags: [Annonces]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: ville
 *         schema:
 *           type: string
 *       - in: query
 *         name: quartier
 *         schema:
 *           type: string
 *       - in: query
 *         name: prixMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: prixMax
 *         schema:
 *           type: number
 *       - in: query
 *         name: surfaceMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: surfaceMax
 *         schema:
 *           type: number
 *       - in: query
 *         name: chambres
 *         schema:
 *           type: integer
 *       - in: query
 *         name: douches
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: projet
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des annonces
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.get("/", annonceController.getAllAnnonces);

/**
 * @openapi
 * /annonces/user/{clerkId}:
 *   get:
 *     summary: Lister les annonces d'un utilisateur
 *     tags: [Annonces]
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des annonces de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.get("/user/:clerkId", annonceController.getAnnoncesByUser);

/**
 * @openapi
 * /annonces/{id}:
 *   get:
 *     summary: Récupérer une annonce par id
 *     tags: [Annonces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annonce trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: Annonce non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/:id", annonceController.getAnnonceById);

/**
 * @openapi
 * /annonces/{id}/view:
 *   post:
 *     summary: Incrémenter le compteur de vues d'une annonce
 *     tags: [Annonces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compteur incrémenté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.post("/:id/view", annonceController.incrementAnnonceViews);

// Routes protégées (création, modification, suppression)
// We accept the Clerk user id as a route parameter and map it to our DB id server-side
//
// requireAuth() : exige un token Clerk valide dans la requête. Sans lui, N'IMPORTE QUI
// pouvait créer une annonce en se faisant passer pour n'importe quel utilisateur juste
// en mettant son clerkId dans l'URL — requireAuth() est la première barrière, mais elle
// ne suffit pas à elle seule (voir la vérification supplémentaire dans le contrôleur).

/**
 * @openapi
 * /annonces/{clerkId}:
 *   post:
 *     summary: Créer une annonce
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               ville:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Annonce créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       403:
 *         description: clerkId ne correspond pas à l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/:clerkId", requireAuth(), annonceController.createAnnonce);

/**
 * @openapi
 * /annonces/{id}:
 *   put:
 *     summary: Mettre à jour une annonce
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Annonce mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.put("/:id", requireAuth(), annonceController.updateAnnonce);

/**
 * @openapi
 * /annonces/{id}:
 *   delete:
 *     summary: Supprimer une annonce
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annonce supprimée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
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