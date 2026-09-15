import { Request, Response } from "express";
import { getAllUsersService, getUserByIdService } from "../services/adminUser.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function getAllUsersController(req: Request, res: Response) {
    try {
        const users = await getAllUsersService();
        return sendSuccess(res, users);
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la récupération des utilisateurs", undefined, error.message || error);
    }
}

export async function getUserByIdController(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.id, 10);
        const user = await getUserByIdService(userId);
        return sendSuccess(res, user);
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la récupération de l'utilisateur", undefined, error.message || error);
    }
}