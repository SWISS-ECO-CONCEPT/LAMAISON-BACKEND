import { Request, Response } from "express";
import * as messageService from "../services/message.service";
import { prisma } from "../utils/db";
import { getDbUserIdByClerkId } from "../services/auth.services";

export const createMessage = async (req: Request, res: Response) => {
  try {
    // req.body.senderId vient du client, donc pas fiable tel quel : on vérifie qu'il
    // correspond bien à l'utilisateur réellement connecté (via son clerkId, vérifié
    // par Clerk), sinon n'importe qui pourrait envoyer un message "de la part" d'un
    // autre utilisateur juste en changeant senderId dans la requête.
    const auth = req.auth();
    const clerkId = auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId || Number(dbUserId) !== Number(req.body.senderId)) {
      return res.status(403).json({ error: "senderId ne correspond pas à l'utilisateur connecté" });
    }

    const message = await messageService.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId1, userId2 } = req.params;

    // Seuls les deux participants de la conversation ont le droit de la lire.
    // On vérifie que l'utilisateur connecté est bien userId1 OU userId2 —
    // sinon, n'importe qui pourrait lire les messages privés de deux inconnus.
    const auth = req.auth();
    const clerkId = auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Non authentifié" });
    }
    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId || (Number(dbUserId) !== Number(userId1) && Number(dbUserId) !== Number(userId2))) {
      return res.status(403).json({ error: "Vous ne participez pas à cette conversation" });
    }

    const messages = await messageService.getConversation(Number(userId1), Number(userId2));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de la conversation" });
  }
};
/**
 * POST /messages/initiate
 * Initiates a conversation between agent and prospect with initial message
 * Body: { prospectClerkId: string, agentClerkId: string, rdvId: number, initialMessage: string }
 */
export const initiateMessaging = async (req: Request, res: Response) => {
  try {
    const { recipientClerkId, rdvId, initialMessage } = req.body;
    const auth = req.auth();
    const senderClerkId = auth?.userId;

    if (!senderClerkId || !recipientClerkId || !initialMessage) {
      return res.status(400).json({
        error: "Missing required fields: senderClerkId, recipientClerkId, initialMessage",
      });
    }

    // Get or create conversation
    const conversation = await messageService.getOrCreateConversation(
      senderClerkId,
      recipientClerkId,
      rdvId
    );

    if (!conversation) {
      return res.status(500).json({ error: "Failed to create conversation" });
    }

    // Create initial message
    const message = await messageService.createMessage({
      senderId: conversation.senderId,
      receiverId: conversation.receiverId,
      content: initialMessage,
    });

    res.status(201).json({
      success: true,
      conversation,
      message,
    });
  } catch (error) {
    console.error("Error initiating messaging:", error);
    res.status(500).json({ error: "Erreur lors de l'initiation de la messagerie" });
  }
};

/**
 * GET /messages/conversation
 * Get or create a conversation between two users (by clerkId)
 * Query: { prospectClerkId, agentClerkId, rdvId }
 */
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { prospectClerkId, agentClerkId, rdvId } = req.query;

    // Même logique : l'appelant doit être l'un des deux participants
    // (le prospect ou l'agent), sinon on refuse.
    const auth = req.auth();
    const callerClerkId = auth?.userId;
    if (!callerClerkId || (callerClerkId !== prospectClerkId && callerClerkId !== agentClerkId)) {
      return res.status(403).json({ error: "Vous ne participez pas à cette conversation" });
    }

    if (!prospectClerkId || !agentClerkId) {
      return res.status(400).json({
        error: "Missing required query parameters: prospectClerkId, agentClerkId",
      });
    }

    const conversation = await messageService.getOrCreateConversation(
      prospectClerkId as string,
      agentClerkId as string,
      rdvId ? Number(rdvId) : undefined
    );

    res.json(conversation);
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de la conversation" });
  }
};

/**
 * GET /messages
 * Get all conversations for the authenticated user
 */
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const auth = req.auth();
    const clerkId = auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const conversations = await messageService.getConversationsForUser(dbUserId);
    res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des conversations" });
  }
};
