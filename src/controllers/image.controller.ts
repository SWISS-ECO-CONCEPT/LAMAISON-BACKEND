import { Request, Response } from "express";
import * as imageService from "../services/image.service";

// Créer une image
// export const createImage = async (req: Request, res: Response) => {
//   try {
//     const userId = (req as any).user.id; // récupéré depuis le token
//      if (!req.body.annonceId) {
//       return res.status(400).json({ message: "annonceId est obligatoire" });
//     }

//     const dto = { annonceId: Number(req.body.annonceId) };
//     const image = await imageService.createImage(req.file!, dto, userId);
//     res.status(201).json(image);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de l'upload de l'image", error });
//   }
// };

export const createImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // récupéré via token
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Vérifier que annonceId est bien envoyé
    if (!req.body.annonceId) {
      return res.status(400).json({ message: "Le champ annonceId est obligatoire" });
    }

    // Transformer en nombre
    const annonceId = Number(req.body.annonceId);
    if (isNaN(annonceId)) {
      return res.status(400).json({ message: "annonceId doit être un nombre valide" });
    }

    // Vérifier que le fichier est bien envoyé
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier n'a été uploadé" });
    }

    const dto = { annonceId };
    const image = await imageService.createImage(req.file, dto, userId);

    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'upload de l'image", error });
  }
};


// Toutes les images
export const getAllImages = async (req: Request, res: Response) => {
  try {
    const annonceId = req.query.annonceId ? Number(req.query.annonceId) : undefined;
    const images = await imageService.getAllImages(annonceId);
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

// Une seule image
export const getImageById = async (req: Request, res: Response) => {
  try {
    const image = await imageService.getImageById(Number(req.params.id));
    if (!image) return res.status(404).json({ message: "Image non trouvée" });
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

// Update image
export const updateImage = async (req: Request, res: Response) => {
  try {
    const dto = { annonceId: req.body.annonceId ? Number(req.body.annonceId) : undefined };
    const image = await imageService.updateImage(Number(req.params.id), dto);
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};

// Delete image
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const image = await imageService.deleteImage(Number(req.params.id));
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
};
