import { Request, Response } from "express";
import { getAllMessagesService, getMessageByIdService, deleteMessageService } from "../services/adminMessage.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function getAllMessagesController(req: Request, res: Response) {
    try {
        const messages = await getAllMessagesService();
        return sendSuccess(res, messages);
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la récupération des messages", undefined, error.message || error);
    }
}

export async function getMessageByIdController(req: Request, res: Response) {
    try {
        const messageId = parseInt(req.params.id, 10);
        const message = await getMessageByIdService(messageId);
        return sendSuccess(res, message);
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la récupération du message", undefined, error.message || error);
    }
}

export async function deleteMessageController(req: Request, res: Response) {
    try {
        const messageId = parseInt(req.params.id, 10);
        const message = await deleteMessageService(messageId);
        return sendSuccess(res, message, 200, "Message supprimé avec succès");
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la suppression du message", undefined, error.message || error);
    }
}