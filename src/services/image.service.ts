import { CreateImageDto, UpdateImageDto } from "../dto/image.dto";
import { saveFile } from "../storage"; // abstraction local/dev ou cloud/prod

// Créer une image (stockage fichier uniquement, pas de DB)
export const createImage = async (file: Express.Multer.File, _dto: CreateImageDto, _userId: number) => {
  const url = await saveFile(file);
  return { url };
};

// Récupérer toutes les images (pas de stockage en DB)
export const getAllImages = async (_annonceId?: number) => {
  return [] as Array<never>;
};

// Récupérer une image par id (non pris en charge sans DB)
export const getImageById = async (_id: number) => {
  return null;
};

// Mettre à jour une image (non pris en charge sans DB)
export const updateImage = async (_id: number, _dto: UpdateImageDto) => {
  return null;
};

// Supprimer une image (non pris en charge sans DB)
export const deleteImage = async (_id: number) => {
  return null;
};