import { Request, Response } from "express";
import * as messageService from "../services/message.service";

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
