import { Request, Response } from "express";
import * as messageService from "../services/message.service";
import { prisma } from "../utils/db";

export const createMessage = async (req: Request, res: Response) => {
  try {
    const message = await messageService.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId1, userId2 } = req.params;
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
    const senderClerkId = (req as any).auth?.userId;

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
