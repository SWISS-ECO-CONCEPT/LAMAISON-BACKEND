import { Request, Response } from "express";
import * as rdvService from "../services/rdv.service";

//  POST /api/rdvs
export const createRdv = async (req: Request, res: Response) => {
  try {
    const rdv = await rdvService.createRdv(req.body);
    res.status(201).json(rdv);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création", error });
  }
};

//  GET /api/rdvs
export const getAllRdvs = async (req: Request, res: Response) => {
  try {
    const rdvs = await rdvService.getAllRdvs();
    res.json(rdvs);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

//  GET /api/rdvs/:id
export const getRdvById = async (req: Request, res: Response) => {
  try {
    const rdv = await rdvService.getRdvById(Number(req.params.id));
    if (!rdv) return res.status(404).json({ message: "RDV non trouvé" });
    res.json(rdv);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

//  PATCH /api/rdvs/:id
export const updateRdv = async (req: Request, res: Response) => {
  try {
    const rdv = await rdvService.updateRdv(Number(req.params.id), req.body);
    res.json(rdv);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};

// DELETE /api/rdvs/:id
export const deleteRdv = async (req: Request, res: Response) => {
  try {
    await rdvService.deleteRdv(Number(req.params.id));
    res.json({ message: "RDV supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
};
