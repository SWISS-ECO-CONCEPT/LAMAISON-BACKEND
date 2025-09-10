import prisma from "../utils/db";
import { CreateImageDto, UpdateImageDto } from "../dto/image.dto";
import { saveFile } from "../storage"; // abstraction local/dev ou cloud/prod

// Créer une image
export const createImage = async (file: Express.Multer.File, dto: CreateImageDto, userId: number) => {
  const url = await saveFile(file); // stocke en local ou cloud

  return prisma.image.create({
    data: {
      url,
      annonceId: dto.annonceId,
      userId,
    },
  });
};

// Récupérer toutes les images (optionnel: filtrer par annonce)
export const getAllImages = async (annonceId?: number) => {
  return prisma.image.findMany({
    where: annonceId ? { annonceId } : undefined,
    include: { annonce: true, user: true },
  });
};

// Récupérer une seule image
export const getImageById = async (id: number) => {
  return prisma.image.findUnique({
    where: { id },
    include: { annonce: true, user: true },
  });
};

// Mettre à jour une image (changer annonce liée par ex)
export const updateImage = async (id: number, dto: UpdateImageDto) => {
  return prisma.image.update({
    where: { id },
    data: dto,
  });
};

// Supprimer une image
export const deleteImage = async (id: number) => {
  return prisma.image.delete({
    where: { id },
  });
};