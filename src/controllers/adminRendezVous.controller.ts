import { Request, Response } from "express";
import { getAllRendezVousService, getRendezVousByIdService, updateRendezVousStatusService, deleteRendezVousService } from "../services/adminRendezVous.service";

export async function getAllRendezVousController(req: Request, res: Response) {
    try {
        const rdvs = await getAllRendezVousService();
        return res.status(200).json({ data: rdvs });
    } catch (error) {
        throw error;
    }
}

export async function getRendezVousByIdController(req: Request, res: Response) {
    try {
        const rdvId = parseInt(req.params.id, 10);
        const rdv = await getRendezVousByIdService(rdvId);
        return res.status(200).json({ data: rdv });
    } catch (error) {
        throw error;
    }
}

export async function updateRendezVousStatusController(req: Request, res: Response) {
    try {
        const rdvId = parseInt(req.params.id, 10);
        const { status } = req.body;
        const rdv = await updateRendezVousStatusService(rdvId, status);
        return res.status(200).json({ data: rdv, message: "Statut du RDV mis à jour avec succès" });
    } catch (error) {
        throw error;
    }
}

export async function deleteRendezVousController(req: Request, res: Response) {
    try {
        const rdvId = parseInt(req.params.id, 10);
        const rdv = await deleteRendezVousService(rdvId);
        return res.status(200).json({ data: rdv, message: "RDV supprimé avec succès" });
    } catch (error) {
        throw error;
    }
}
