import prisma from "../utils/db";
import { CreateFavoriDTO, FavoriResponseDTO } from "../dto/favoris.dto";

export const favoriService = {
  async createFavori(userId: number, data: CreateFavoriDTO): Promise<FavoriResponseDTO> {
    return prisma.favori.create({
      data: {
        annonceId: data.annonceId,
        userId,
      },
    });
  },

  async getUserFavoris(userId: number): Promise<FavoriResponseDTO[]> {
    return prisma.favori.findMany({
      where: { userId },
      include: { annonce: true }, // utile si on veut les détails des annonces
    });
  },

  async deleteFavori(userId: number, favoriId: number): Promise<FavoriResponseDTO> {
    // Vérification que le favori appartient bien au user
    const favori = await prisma.favori.findUnique({ where: { id: favoriId } });
    if (!favori || favori.userId !== userId) {
      throw new Error("Action non autorisée");
    }

    return prisma.favori.delete({
      where: { id: favoriId },
    });
  },
};