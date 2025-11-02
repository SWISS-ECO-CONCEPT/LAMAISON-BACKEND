import { Request, Response } from "express";
import prisma from "../utils/db";
import { TypeBien } from "@prisma/client";
import { CreateAnnonceDto, UpdateAnnonceDto } from "../dto/annonce.dto";
import { getDbUserIdByClerkId } from "../services/auth.services";

// ✅ Créer une annonce
export const createAnnonce = async (req: Request, res: Response) => {
  console.log("requete:",req)
  console.log('Incoming createAnnonce body:', req.body);
  try {
    const clerkId = req.params.clerkId as string | undefined;
    if (!clerkId) {
      return res.status(400).json({ message: 'clerkId parameter is required in the route.' });
    }

    // Map clerkId -> our DB user id
    const dbUserId = await getDbUserIdByClerkId(clerkId);
    if (!dbUserId) {
      return res.status(404).json({ message: 'Utilisateur Clerk introuvable dans la base.' });
    }

    const data: CreateAnnonceDto = req.body;

    // Build prisma data object using the found proprietaire id
    const prismaData: any = {
      titre: data.titre,
      description: data.description,
      prix: Number(data.prix),
      ville: data.ville,
      surface: data.surface ?? null,
      chambres: data.chambres ?? null,
      douches: data.douches ?? null,
      type: data.type ? (data.type as TypeBien) : null,
      proprietaire: { connect: { id: Number(dbUserId) } },
    };

    // If images are provided as URLs or objects, handle them
    if (data.images?.length) {
      prismaData.Image = {
        create: data.images.map((img) => ({
          url: typeof img === 'string' ? img : img.url,
          user: { connect: { id: Number(dbUserId) } },
        })),
      };
    }

    const annonce = await prisma.annonce.create({
      data: prismaData,
      include: { Image: true, proprietaire: true },
    });

    res.status(201).json({ message: 'Annonce créée avec succès.', data: annonce });
  } catch (error: any) {
    console.error("Erreur lors de la création de l'annonce :", error);
    res.status(500).json({ message: 'Erreur lors de la création', error: error.message || error });
  }
};

// ✅ Récupérer toutes les annonces
export const getAllAnnonces = async (req: Request, res: Response) => {
  try {
    const annonces = await prisma.annonce.findMany({
      include: { Image: true, proprietaire: true },
    });
    res.json(annonces);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

// ✅ Récupérer une annonce par ID
export const getAnnonceById = async (req: Request, res: Response) => {
  try {
    const annonce = await prisma.annonce.findUnique({
      where: { id: Number(req.params.id) },
      include: { Image: true, proprietaire: true },
    });
    if (!annonce) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }
    res.json(annonce);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};

// ✅ Mettre à jour une annonce
export const updateAnnonce = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data: UpdateAnnonceDto = req.body;

    const annonceExistante = await prisma.annonce.findUnique({
      where: { id },
      include: { Image: true },
    });

    if (!annonceExistante) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    // ✅ Si nouvelles images : on supprime les anciennes
    if (data.images?.length) {
      await prisma.image.deleteMany({ where: { annonceId: id } });
    }

    const annonce = await prisma.annonce.update({
      where: { id },
      data: {
        titre: data.titre ?? undefined,
        description: data.description ?? undefined,
        prix: data.prix ? Number(data.prix) : undefined,
        ville: data.ville ?? undefined,
        surface: data.surface ?? undefined,
        chambres: data.chambres ?? undefined,
        douches: data.douches ?? undefined,
        type: data.type ? (data.type as TypeBien) : undefined,

        Image: data.images?.length
          ? {
              create: data.images.map((img) => ({
                url: typeof img === "string" ? img : img.url,
                user: { connect: { id: annonceExistante.proprietaireId } },

              })),
            }
          : undefined,
      },
      include: { Image: true, proprietaire: true },
    });

    res.json({
      message: "Annonce mise à jour avec succès.",
      data: annonce,
    });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour",
      error: error.message || error,
    });
  }
};

// ✅ Supprimer une annonce
export const deleteAnnonce = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.annonce.delete({ where: { id } });
    res.json({ message: "Annonce supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
};



// import { Request, Response } from "express";
// import * as annonceService from "../services/annonce.service";

// export const createAnnonce = async (req: Request, res: Response) => {
//     console.log(req.body)
//   try {
//     const annonce = await annonceService.createAnnonce(req.body);
//     res.status(201).json(annonce);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la création", error });
//   }
// };

// export const getAllAnnonces = async (req: Request, res: Response) => {
//   try {
//     const annonces = await annonceService.getAllAnnonces();
//     res.json(annonces);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la récupération", error });
//   }
// };

// export const getAnnonceById = async (req: Request, res: Response) => {
//   try {
//     const annonce = await annonceService.getAnnonceById(Number(req.params.id));
//     if (!annonce) return res.status(404).json({ message: "Annonce non trouvée" });
//     res.json(annonce);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la récupération", error });
//   }
// };

// export const updateAnnonce = async (req: Request, res: Response) => {
//   try {
//     const annonce = await annonceService.updateAnnonce(Number(req.params.id), req.body);
//     res.json(annonce);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la mise à jour", error });
//   }
// };

// export const deleteAnnonce = async (req: Request, res: Response) => {
//   try {
//     await annonceService.deleteAnnonce(Number(req.params.id));
//     res.json({ message: "Annonce supprimée" });
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la suppression", error });
//   }
// };
