import { Request, Response } from "express";
import { getAllAnnoncesService, getAnnonceByIdService, deleteAnnonceService } from "../services/adminAnnonce.service";

export async function getAllAnnoncesController(req: Request, res: Response) {
    try {
        const annonces = await getAllAnnoncesService();
        return res.status(200).json({ data: annonces });
    } catch (error) {
        throw error;
    }
}

export async function getAnnonceByIdController(req: Request, res: Response) {
    try {
        const annonceId = parseInt(req.params.id, 10);
        const annonce = await getAnnonceByIdService(annonceId);
        return res.status(200).json({ data: annonce });
    } catch (error) {
        throw error;
    }
}

export async function deleteAnnonceController(req: Request, res: Response) {
    try {
        const annonceId = parseInt(req.params.id, 10);
        const annonce = await deleteAnnonceService(annonceId);
        return res.status(200).json({ data: annonce, message: "Annonce supprimée avec succès" });
    } catch (error) {
        throw error;
    }
}
