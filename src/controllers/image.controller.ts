import { Request, Response } from "express";
import { saveFile } from "../storage";

export const createImage = async (req: Request, res: Response) => {
  try {
    // Vérifier que le fichier est bien envoyé
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier n'a été uploadé" });
    }

    // Sauvegarder le fichier (local ou cloud selon storage)
    const url = await saveFile(req.file);
    // Retour simple, plus d'enregistrement DB
    res.status(201).json({ url });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'upload de l'image", error });
  }
};

// Toutes les images (plus de stockage en DB -> retourne vide)
export const getAllImages = async (_req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

// Deprecated endpoints since Image is no longer a model
export const getImageById = async (_req: Request, res: Response) => {
  return res.status(410).json({ message: "Endpoint obsolète" });
};

export const updateImage = async (_req: Request, res: Response) => {
  return res.status(410).json({ message: "Endpoint obsolète" });
};

// Delete image
export const deleteImage = async (_req: Request, res: Response) => {
  return res.status(410).json({ message: "Endpoint obsolète" });
};
