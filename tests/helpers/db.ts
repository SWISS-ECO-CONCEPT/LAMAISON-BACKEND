import { prisma } from "../../src/utils/db";

export { prisma };

// Supprime toutes les données de test, dans l'ordre qui respecte les
// contraintes de clé étrangère (les tables "enfants" d'abord, qui
// référencent d'autres tables, puis les tables "parentes").
// Centralisé ici car certaines actions métier ont des effets de bord
// (ex: accepter un RDV envoie automatiquement un message) qu'il est facile
// d'oublier de nettoyer — ça provoque alors des erreurs de clé étrangère
// dans un tout autre fichier de test, pas forcément celui qui a créé la donnée.
export async function cleanDatabase() {
  await prisma.message.deleteMany();
  await prisma.favori.deleteMany();
  await prisma.rendezVous.deleteMany();
  await prisma.annonce.deleteMany();
  await prisma.user.deleteMany();
}