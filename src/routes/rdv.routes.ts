import {Router} from "express"
import * as rdvController from "../controllers/rdv.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

/**
 * @openapi
 * /rdvs:
 *   post:
 *     summary: Créer une demande de rendez-vous (prospect)
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               annonceId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date-time
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: RDV créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/", requireAuth(), rdvController.createRdv);

/**
 * @openapi
 * /rdvs:
 *   get:
 *     summary: Lister les rendez-vous (filtrables par prospect, agent ou annonce)
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: prospectClerkId
 *         schema:
 *           type: string
 *       - in: query
 *         name: agentClerkId
 *         schema:
 *           type: string
 *       - in: query
 *         name: annonceId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des RDV
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.get("/", requireAuth(), rdvController.getAllRdvs);

/**
 * @openapi
 * /rdvs/{id}:
 *   get:
 *     summary: Récupérer un rendez-vous par son id
 *     tags: [Rendez-vous]
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
 *         description: RDV trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: RDV non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/:id", requireAuth(), rdvController.getRdvById);

/**
 * @openapi
 * /rdvs/{id}:
 *   patch:
 *     summary: Mettre à jour le statut d'un rendez-vous (accepter/refuser/proposer un créneau)
 *     description: >
 *       Route générique de compatibilité — le comportement dépend de `status` :
 *       ACCEPTE, REFUSE, PROPOSE (nécessite `proposedDate`) ou EN_ATTENTE.
 *       Les routes dédiées ci-dessous (/accept, /reject, /propose, /proposal/*)
 *       font exactement la même chose de façon plus explicite.
 *     tags: [Rendez-vous]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTE, REFUSE, PROPOSE, EN_ATTENTE]
 *               proposedDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: RDV mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.patch("/:id", requireAuth(), rdvController.updateRdv);

/**
 * @openapi
 * /rdvs/{id}:
 *   delete:
 *     summary: Supprimer un rendez-vous
 *     description: Réservé à l'agent ou au prospect participant à ce RDV.
 *     tags: [Rendez-vous]
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
 *         description: RDV supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.delete("/:id", requireAuth(), rdvController.deleteRdv);

/**
 * @openapi
 * /rdvs/{id}/propose:
 *   post:
 *     summary: Proposer un nouveau créneau (agent)
 *     tags: [Rendez-vous]
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
 *             required: [proposedDate]
 *             properties:
 *               proposedDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Créneau proposé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.post("/:id/propose", requireAuth(), rdvController.proposeRdv);

/**
 * @openapi
 * /rdvs/{id}/accept:
 *   post:
 *     summary: Accepter une demande de rendez-vous (agent)
 *     tags: [Rendez-vous]
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
 *         description: RDV accepté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.post("/:id/accept", requireAuth(), rdvController.acceptRdv);

/**
 * @openapi
 * /rdvs/{id}/reject:
 *   post:
 *     summary: Refuser une demande de rendez-vous (agent)
 *     tags: [Rendez-vous]
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
 *         description: RDV refusé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.post("/:id/reject", requireAuth(), rdvController.rejectRdv);

/**
 * @openapi
 * /rdvs/{id}/proposal/accept:
 *   post:
 *     summary: Accepter le créneau proposé par l'agent (prospect)
 *     tags: [Rendez-vous]
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
 *         description: Proposition acceptée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.post("/:id/proposal/accept", requireAuth(), rdvController.acceptProposal);

/**
 * @openapi
 * /rdvs/{id}/proposal/reject:
 *   post:
 *     summary: Refuser le créneau proposé par l'agent (prospect)
 *     tags: [Rendez-vous]
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
 *         description: Proposition refusée, RDV repasse en attente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.post("/:id/proposal/reject", requireAuth(), rdvController.rejectProposal);

export default router;