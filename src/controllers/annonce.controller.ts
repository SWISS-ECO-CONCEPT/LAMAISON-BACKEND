import { Request, Response } from "express";
import * as annonceService from "../services/annonce.service";

export const createAnnonce = async (req: Request, res: Response) => {
  try {
    const annonce = await annonceService.createAnnonce(req.body);
    res.status(201).json(annonce);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création", error });
  }
};

export const getAllAnnonces = async (req: Request, res: Response) => {
  try {
    const annonces = await annonceService.getAllAnnonces();
    res.json(annonces);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

export const getAnnonceById = async (req: Request, res: Response) => {
  try {
    const annonce = await annonceService.getAnnonceById(Number(req.params.id));
    if (!annonce) return res.status(404).json({ message: "Annonce non trouvée" });
    res.json(annonce);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

export const updateAnnonce = async (req: Request, res: Response) => {
  try {
    const annonce = await annonceService.updateAnnonce(Number(req.params.id), req.body);
    res.json(annonce);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};

export const deleteAnnonce = async (req: Request, res: Response) => {
  try {
    await annonceService.deleteAnnonce(Number(req.params.id));
    res.json({ message: "Annonce supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
};
