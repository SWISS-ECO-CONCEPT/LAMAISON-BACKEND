import { Router } from "express";
import { createMessage, getConversation, initiateMessaging, getOrCreateConversation, getUserConversations } from "../controllers/message.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

/**
 * @openapi
 * /messages:
 *   get:
 *     summary: Lister toutes les conversations de l'utilisateur connecté
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.get("/", requireAuth(), getUserConversations);

/**
 * @openapi
 * /messages:
 *   post:
 *     summary: Envoyer un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senderId, receiverId, content]
 *             properties:
 *               senderId:
 *                 type: integer
 *               receiverId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message envoyé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       403:
 *         description: senderId ne correspond pas à l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/", requireAuth(),createMessage);

/**
 * @openapi
 * /messages/{userId1}/{userId2}:
 *   get:
 *     summary: Récupérer l'historique d'une conversation entre deux utilisateurs
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId1
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId2
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       403:
 *         description: Ne participe pas à cette conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/:userId1/:userId2", requireAuth(), getConversation);

// New endpoints for auto-messaging system

/**
 * @openapi
 * /messages/initiate:
 *   post:
 *     summary: Initier une conversation avec un premier message automatique
 *     description: Utilisé par le backend lors d'une action sur un RDV (proposition, acceptation, refus) pour créer automatiquement la conversation entre l'agent et le prospect.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientClerkId, initialMessage]
 *             properties:
 *               recipientClerkId:
 *                 type: string
 *               rdvId:
 *                 type: integer
 *               initialMessage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation initiée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.post("/initiate", requireAuth(), initiateMessaging);

/**
 * @openapi
 * /messages/conversation:
 *   get:
 *     summary: Récupérer ou créer une conversation entre un prospect et un agent
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: prospectClerkId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: agentClerkId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: rdvId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation trouvée ou créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       403:
 *         description: Ne participe pas à cette conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/conversation", requireAuth(), getOrCreateConversation);

export default router;