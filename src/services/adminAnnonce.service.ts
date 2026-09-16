import { prisma } from "../utils/db";

export async function getAllAnnoncesService() {
    try {
        return await prisma.annonce.findMany({
            include: {
                proprietaire: false,
                rendezVous: false,
                favoris: false
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function getAnnonceByIdService(annonceId: number) {
    try {
        return await prisma.annonce.findUnique({
            where: { id: annonceId },
            include: {
                proprietaire: true,
                favoris: true,
                rendezVous: true
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function deleteAnnonceService(annonceId: number) {
    try {
        // Les favoris et RDV liés à cette annonce doivent être supprimés AVANT
        // l'annonce elle-même, sinon MySQL refuse (contrainte de clé étrangère).
        // Même logique que deleteAnnonce côté client (annonce.controller.ts) —
        // celle-ci avait été oubliée côté panel admin.
        await prisma.favori.deleteMany({ where: { annonceId } });
        await prisma.rendezVous.deleteMany({ where: { annonceId } });
        return await prisma.annonce.delete({
            where: { id: annonceId }
        });
    } catch (error) {
        throw error;
    }
}