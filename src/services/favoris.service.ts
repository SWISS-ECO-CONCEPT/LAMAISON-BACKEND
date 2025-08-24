import { PrismaClient } from "@prisma/client";
import { CreateFavoriDTO } from "../dto/favoris.dto";

const prisma = new PrismaClient();

export class FavorisService {
  // Ajouter un favori
  static async addFavori(userId: number, data: CreateFavoriDTO) {
    return prisma.favori.create({
      data: {
        userId,
        annonceId: data.annonceId,
      },
    });
  }

  // Supprimer un favori
  static async removeFavori(userId: number, annonceId: number) {
    return prisma.favori.deleteMany({
      where: { userId, annonceId },
    });
  }

  // Récupérer les favoris d’un user
  static async getFavorisByUser(userId: number) {
    return prisma.favori.findMany({
      where: { userId },
      include: {
        annonce: true, // ramène aussi les détails des annonces
      },
    });
  }
}
