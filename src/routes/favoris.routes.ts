import { Router } from "express";
import * as FavorisController from "../controllers/favoris.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

// requireAuth() sur les 3 routes : sans ça, n'importe qui pouvait ajouter/lire/supprimer
// les favoris de n'importe quel utilisateur juste en connaissant son clerkId.

/**
 * @openapi
 * /favoris/{clerkId}:
 *   post:
 *     summary: Ajouter un favori
 *     tags: [Favoris]
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
 *               annonceId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Favori créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       403:
 *         description: Ne peut modifier que ses propres favoris
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/:clerkId", requireAuth(), FavorisController.createFavori);

/**
 * @openapi
 * /favoris/{annonceId}/{clerkId}:
 *   delete:
 *     summary: Supprimer un favori
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: annonceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favori supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.delete("/:annonceId/:clerkId", requireAuth(), FavorisController.deleteFavori);
/**
 * @openapi
 * /favoris/{clerkId}:
 *   get:
 *     summary: Récupérer les favoris d'un utilisateur
 *     tags: [Favoris]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des favoris
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.get("/:clerkId", requireAuth(), FavorisController.getUserFavoris);

export default router;