import { Request, Response } from "express";
import { prisma } from "../utils/db";
import { TypeBien, Prisma } from "../../generated/prisma/client";
import { CreateAnnonceDto, UpdateAnnonceDto } from "../dto/annonce.dto";
import { ProjetType } from "../../generated/prisma/client";
import { getDbUserIdByClerkId } from "../services/auth.services";
import * as annonceService from "../services/annonce.service";
// ✅ Créer une annonce
export const createAnnonce = async (req: Request, res: Response) => {
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
    // Normalize and validate images
    const normalizedImages: string[] = Array.isArray(data.images)
      ? data.images
        .map((img: any) => (typeof img === 'string' ? img : img?.url))
        .filter(Boolean)
      : [];
    if (!normalizedImages.length) {
      return res.status(400).json({ message: 'Au moins une image est requise.' });
    }

    // Build prisma data object using the found proprietaire id
    const prismaData: any = {
      titre: data.titre,
      description: data.description,
      prix: Number(data.prix),
      ville: data.ville,
      surface: data.surface ?? null,
      chambres: data.chambres ?? null,
      douches: data.douches ?? null,
      type: data.type ? data.type as TypeBien : null,
      projet: data.projet ? (data.projet as ProjetType) : undefined,
      proprietaire: { connect: { id: Number(dbUserId) } },
      images: normalizedImages,
    };

    const annonce = await prisma.annonce.create({
      data: prismaData as any,
      include: { proprietaire: true },
    });

    res.status(201).json({ message: 'Annonce créée avec succès.', data: annonce });
  } catch (error: any) {
    console.error("Erreur lors de la création de l'annonce :", error);
    res.status(500).json({ message: 'Erreur lors de la création', error: error.message || error });
  }
};

// ✅ Récupérer toutes les annonces avec recherche et filtres
export const getAllAnnonces = async (req: Request, res: Response) => {
  try {
    const {
      search,        // Recherche textuelle dans titre et description
      ville,         // Filtrer par ville exacte
      prixMin,       // Prix minimum
      prixMax,       // Prix maximum
      surfaceMin,    // Surface minimum
      surfaceMax,    // Surface maximum
      chambres,      // Nombre minimum de chambres
      douches,       // Nombre minimum de douches
      type,          // Type de bien (TypeBien)
      projet,        // Projet (achat/location)
    } = req.query;

    // Construction des filtres Prisma
    const where: any = {};

    // Recherche textuelle (titre ou description)
    if (search && typeof search === 'string') {
      where.OR = [
        { titre: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Filtre par ville
    if (ville && typeof ville === 'string') {
      where.ville = { contains: ville };
    }

    // Filtre par projet
    if (projet && typeof projet === 'string') {
      where.projet = projet;
    }

    // Filtre par prix (min et/ou max)
    if (prixMin || prixMax) {
      where.prix = {};
      if (prixMin) {
        where.prix.gte = Number(prixMin);
      }
      if (prixMax) {
        where.prix.lte = Number(prixMax);
      }
    }

    // Filtre par surface (min et/ou max)
    if (surfaceMin || surfaceMax) {
      where.surface = {};
      if (surfaceMin) {
        where.surface.gte = Number(surfaceMin);
      }
      if (surfaceMax) {
        where.surface.lte = Number(surfaceMax);
      }
    }

    // Filtre par nombre de chambres (minimum)
    if (chambres) {
      where.chambres = { gte: Number(chambres) };
    }

    // Filtre par nombre de douches (minimum)
    if (douches) {
      where.douches = { gte: Number(douches) };
    }

    // Filtre par type de bien
    if (type && typeof type === 'string') {
      where.type = type;
    }

    const annonces = await annonceService.getAllAnnonces(where);

    res.json(annonces);
  } catch (error: any) {
    console.error("Erreur lors de la récupération des annonces:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération",
      error: error.message || error
    });
  }
};

// ✅ Récupérer toutes les annonces d'un utilisateur (via son clerkId)
export const getAnnoncesByUser = async (req: Request, res: Response) => {
  try {
    const clerkId = req.params.clerkId as string | undefined;
    if (!clerkId) {
      return res.status(400).json({ message: 'clerkId parameter is required in the route.' });
    }

    const {
      search, ville, prixMin, prixMax, surfaceMin, surfaceMax, chambres, douches, type, projet,
    } = req.query;

    const where: any = {
      proprietaire: { clerkId },
    };

    if (search && typeof search === 'string') {
      where.OR = [
        { titre: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (ville && typeof ville === 'string') { where.ville = { contains: ville }; }
    if (projet && typeof projet === 'string') { where.projet = projet; }
    if (prixMin || prixMax) {
      where.prix = {};
      if (prixMin) { where.prix.gte = Number(prixMin); }
      if (prixMax) { where.prix.lte = Number(prixMax); }
    }
    if (surfaceMin || surfaceMax) {
      where.surface = {};
      if (surfaceMin) { where.surface.gte = Number(surfaceMin); }
      if (surfaceMax) { where.surface.lte = Number(surfaceMax); }
    }
    if (chambres) { where.chambres = { gte: Number(chambres) }; }
    if (douches) { where.douches = { gte: Number(douches) }; }
    if (type && typeof type === 'string') { where.type = type; }

    const annonces = await annonceService.getAnnoncesByUser(clerkId, where);
    res.json(annonces);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des annonces utilisateur:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération', error: error.message || error });
  }
};

// ✅ Récupérer une annonce par ID
export const getAnnonceById = async (req: Request, res: Response) => {
  try {
    const annonce = await prisma.annonce.findUnique({
      where: { id: Number(req.params.id) },
      include: { proprietaire: true },
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
    const annonceExistante = await prisma.annonce.findUnique({ where: { id } });
    if (!annonceExistante) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    const annonce = await prisma.annonce.update({
      where: { id },
      data: ({
        titre: data.titre ?? undefined,
        description: data.description ?? undefined,
        prix: data.prix ? Number(data.prix) : undefined,
        ville: data.ville ?? undefined,
        surface: data.surface ?? undefined,
        chambres: data.chambres ?? undefined,
        douches: data.douches ?? undefined,
        type: data.type ? data.type as TypeBien : undefined,
        projet: data.projet ?? undefined,
        images: Array.isArray(data.images)
          ? data.images.map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
          : undefined,
      } as any),
      include: { proprietaire: true },
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

    // Vérifier que l'annonce existe
    const annonceExistante = await prisma.annonce.findUnique({ where: { id } });
    if (!annonceExistante) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    // Supprimer en cascade: d'abord les favoris, puis les RDVs, puis l'annonce
    await prisma.favori.deleteMany({ where: { annonceId: id } });
    await prisma.rendezVous.deleteMany({ where: { annonceId: id } });
    await prisma.annonce.delete({ where: { id } });

    res.json({ message: "Annonce supprimée avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({
      message: "Erreur lors de la suppression",
      error: error.message || error
    });
  }
};

// ✅ Incrémenter le nombre de vues d'une annonce
export const incrementAnnonceViews = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID d'annonce invalide" });
    }

    const updated = await prisma.annonce.update({
      where: { id },
      data: {
        vues: {
          increment: 1,
        } as Prisma.IntFieldUpdateOperationsInput,
      },
      select: {
        id: true,
        vues: true,
      },
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("Erreur lors de l'incrémentation des vues :", error);
    // Gestion du cas où l'annonce n'existe pas
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }
    return res.status(500).json({
      message: "Erreur lors de l'incrémentation des vues",
      error: error.message || error,
    });
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
