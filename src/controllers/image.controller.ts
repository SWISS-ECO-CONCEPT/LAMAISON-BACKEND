import { Request, Response } from "express";
import { saveFile } from "../storage";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const createImage = async (req: Request, res: Response) => {
  try {
    // Vérifier que le fichier est bien envoyé
    if (!req.file) {
      return sendError(res, 400, "Aucun fichier n'a été uploadé");
    }
    // Sauvegarder le fichier (local ou cloud selon storage)
    const url = await saveFile(req.file);
    // Retour simple, plus d'enregistrement DB
    return sendSuccess(res, { url }, 201);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de l'upload de l'image", undefined, error.message || error);
  }
};

// Toutes les images (plus de stockage en DB -> retourne vide)
export const getAllImages = async (_req: Request, res: Response) => {
  try {
    return sendSuccess(res, []);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de la récupération", undefined, error.message || error);
  }
};

// Deprecated endpoints since Image is no longer a model
export const getImageById = async (_req: Request, res: Response) => {
  return sendError(res, 410, "Endpoint obsolète");
};

export const updateImage = async (_req: Request, res: Response) => {
  return sendError(res, 410, "Endpoint obsolète");
};
// Delete image
export const deleteImage = async (_req: Request, res: Response) => {
  return sendError(res, 410, "Endpoint obsolète");
};