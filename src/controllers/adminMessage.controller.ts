import { Request, Response } from "express";
import { getAllMessagesService, getMessageByIdService, deleteMessageService } from "../services/adminMessage.service";

export async function getAllMessagesController(req: Request, res: Response) {
    try {
        const messages = await getAllMessagesService();
        return res.status(200).json({ data: messages });
    } catch (error) {
        throw error;
    }
}

export async function getMessageByIdController(req: Request, res: Response) {
    try {
        const messageId = parseInt(req.params.id, 10);
        const message = await getMessageByIdService(messageId);
        return res.status(200).json({ data: message });
    } catch (error) {
        throw error;
    }
}

export async function deleteMessageController(req: Request, res: Response) {
    try {
        const messageId = parseInt(req.params.id, 10);
        const message = await deleteMessageService(messageId);
        return res.status(200).json({ data: message, message: "Message supprimé avec succès" });
    } catch (error) {
        throw error;
    }
}
