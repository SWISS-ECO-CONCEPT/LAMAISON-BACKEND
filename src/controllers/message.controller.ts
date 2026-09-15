import { Request, Response } from "express";
import * as messageService from "../services/message.service";
import { prisma } from "../utils/db";
import { getDbUserIdByClerkId } from "../services/auth.services";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const createMessage = async (req: Request, res: Response) => {
  try {
    // req.body.senderId vient du client, donc pas fiable tel quel : on vérifie qu'il
    // correspond bien à l'utilisateur réellement connecté (via son clerkId, vérifié
    // par Clerk), sinon n'importe qui pourrait envoyer un message "de la part" d'un
    // autre utilisateur juste en changeant senderId dans la requête.

    const auth = req.auth();
    const clerkId = auth?.userId;
    if (!clerkId) {
      return sendError(res, 401, "Non authentifié");
    }

    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId || Number(dbUserId) !== Number(req.body.senderId)) {
      return sendError(res, 403, "senderId ne correspond pas à l'utilisateur connecté");
    }

    const message = await messageService.createMessage(req.body);
    return sendSuccess(res, message, 201);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de l'envoi du message");
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
      return sendError(res, 401, "Non authentifié");
    }
    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId || (Number(dbUserId) !== Number(userId1) && Number(dbUserId) !== Number(userId2))) {
      return sendError(res, 403, "Vous ne participez pas à cette conversation");
    }

    const messages = await messageService.getConversation(Number(userId1), Number(userId2));
    return sendSuccess(res, messages);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de la récupération de la conversation");
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
      return sendError(res, 400, "Missing required fields: senderClerkId, recipientClerkId, initialMessage");
    }

    const conversation = await messageService.getOrCreateConversation(
      senderClerkId,
      recipientClerkId,
      rdvId
    );

    if (!conversation) {
      return sendError(res, 500, "Failed to create conversation");
    }

    const message = await messageService.createMessage({
      senderId: conversation.senderId,
      receiverId: conversation.receiverId,
      content: initialMessage,
    });

    // Anciennement { success: true, conversation, message } à plat — maintenant
    // regroupé dans .data comme partout ailleurs, mais la forme interne (conversation
    // + message) est conservée pour ne pas casser la logique qui les utilise.
    return sendSuccess(res, { conversation, message }, 201);
  } catch (error: any) {
    console.error("Error initiating messaging:", error);
    return sendError(res, 500, "Erreur lors de l'initiation de la messagerie");
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
      return sendError(res, 403, "Vous ne participez pas à cette conversation");
    }

    if (!prospectClerkId || !agentClerkId) {
      return sendError(res, 400, "Missing required query parameters: prospectClerkId, agentClerkId");
    }

    const conversation = await messageService.getOrCreateConversation(
      prospectClerkId as string,
      agentClerkId as string,
      rdvId ? Number(rdvId) : undefined
    );

    return sendSuccess(res, conversation);
  } catch (error: any) {
    console.error("Error getting conversation:", error);
    return sendError(res, 500, "Erreur lors de la récupération de la conversation");
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
      return sendError(res, 401, "Non authentifié");
    }

    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId) {
      return sendError(res, 404, "Utilisateur non trouvé");
    }

    const conversations = await messageService.getConversationsForUser(dbUserId);
    return sendSuccess(res, conversations);
  } catch (error: any) {
    console.error("Error getting conversations:", error);
    return sendError(res, 500, "Erreur lors de la récupération des conversations");
  }
};