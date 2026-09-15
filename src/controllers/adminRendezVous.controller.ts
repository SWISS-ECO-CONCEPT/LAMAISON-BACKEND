import { Request, Response } from "express";
import { getAllRendezVousService, getRendezVousByIdService, updateRendezVousStatusService, deleteRendezVousService } from "../services/adminRendezVous.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function getAllRendezVousController(req: Request, res: Response) {
    try {
        const rdvs = await getAllRendezVousService();
        return sendSuccess(res, rdvs);
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la récupération des rendez-vous", undefined, error.message || error);
    }
}

export async function getRendezVousByIdController(req: Request, res: Response) {
    try {
        const rdvId = parseInt(req.params.id, 10);
        const rdv = await getRendezVousByIdService(rdvId);
        return sendSuccess(res, rdv);
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la récupération du rendez-vous", undefined, error.message || error);
    }
}

export async function updateRendezVousStatusController(req: Request, res: Response) {
    try {
        const rdvId = parseInt(req.params.id, 10);
        const { status } = req.body;
        const rdv = await updateRendezVousStatusService(rdvId, status);
        return sendSuccess(res, rdv, 200, "Statut du RDV mis à jour avec succès");
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la mise à jour du statut", undefined, error.message || error);
    }
}

export async function deleteRendezVousController(req: Request, res: Response) {
    try {
        const rdvId = parseInt(req.params.id, 10);
        const rdv = await deleteRendezVousService(rdvId);
        return sendSuccess(res, rdv, 200, "RDV supprimé avec succès");
    } catch (error: any) {
        return sendError(res, 500, "Erreur lors de la suppression du rendez-vous", undefined, error.message || error);
    }
}