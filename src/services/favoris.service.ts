import {prisma} from "../utils/db";
import { CreateFavoriDTO, FavoriResponseDTO } from "../dto/favoris.dto";

export const favoriService = {
  async createFavori(userId: number, data: CreateFavoriDTO): Promise<FavoriResponseDTO> {
    try {
      return await prisma.favori.create({
        data: {
          annonceId: data.annonceId,
          userId,
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        const existing = await prisma.favori.findUnique({
          where: {
            userId_annonceId: {
              userId,
              annonceId: data.annonceId,
            },
          },
        });

        if (existing) {
          return existing as unknown as FavoriResponseDTO;
        }
      }

      throw error;
    }
  },

  async getUserFavoris(userId: number): Promise<FavoriResponseDTO[]> {
    return prisma.favori.findMany({
      where: { userId },
      include: { annonce: true }, // utile si on veut les détails des annonces
    });
  },

  async deleteFavori(userId: number, annonceId: number): Promise<FavoriResponseDTO | null> {
    const existing = await prisma.favori.findUnique({
      where: {
        userId_annonceId: {
          userId,
          annonceId,
        },
      },
    });

    if (!existing) {
      return null;
    }

    return prisma.favori.delete({
      where: { id: existing.id },
    });
  },
};