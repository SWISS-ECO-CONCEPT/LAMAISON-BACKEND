import { Request, Response } from "express";
import { getAllAnnoncesService, getAnnonceByIdService, deleteAnnonceService } from "../services/adminAnnonce.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function getAllAnnoncesController(req: Request, res: Response) {
    try {
        const annonces = await getAllAnnoncesService();
        return sendSuccess(res, annonces);
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la récupération des annonces", undefined, error.message || error);
    }
}

export async function getAnnonceByIdController(req: Request, res: Response) {
    try {
        const annonceId = parseInt(req.params.id, 10);
        const annonce = await getAnnonceByIdService(annonceId);
        return sendSuccess(res, annonce);
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la récupération de l'annonce", undefined, error.message || error);
    }
}

export async function deleteAnnonceController(req: Request, res: Response) {
    try {
        const annonceId = parseInt(req.params.id, 10);
        const annonce = await deleteAnnonceService(annonceId);
        return sendSuccess(res, annonce, 200, "Annonce supprimée avec succès");
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la suppression de l'annonce", undefined, error.message || error);
    }
}