import { prisma } from "../utils/db";

export async function getAllRendezVousService() {
    try {
        return await prisma.rendezVous.findMany({
            include: {
                prospect: true,
                annonce: {
                    include: {
                        proprietaire: true
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function getRendezVousByIdService(rdvId: number) {
    try {
        return await prisma.rendezVous.findUnique({
            where: { id: rdvId },
            include: {
                prospect: true,
                annonce: {
                    include: {
                        proprietaire: true
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function updateRendezVousStatusService(rdvId: number, status: string) {
    try {
        return await prisma.rendezVous.update({
            where: { id: rdvId },
            data: { status: status as any },
            include: {
                prospect: true,
                annonce: true
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function deleteRendezVousService(rdvId: number) {
    try {
        return await prisma.rendezVous.delete({
            where: { id: rdvId }
        });
    } catch (error) {
        throw error;
    }
}
