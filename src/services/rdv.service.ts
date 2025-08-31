import prisma from "../utils/db";
import { CreateRdvDto, UpdateRdvDto } from "../dto/rdv.dto";

// Service de gestion des rendez-vous
export const createRdv = async (data: CreateRdvDto) => {
   // Vérifier que le user associé est bien un prospect
  const user = await prisma.user.findUnique({ where: { id: data.prospectId } });

  if (!user || user.role !== "PROSPECT") {
    throw new Error("Seul un prospect peut demander un RDV");
  }

  // Vérifier que l’annonce existe et appartient bien à un agent
  const annonce = await prisma.annonce.findUnique({
    where: { id: data.annonceId },
    include: { proprietaire: true },
  });

  if (!annonce || annonce.proprietaire.role !== "AGENT") {
    throw new Error("Le RDV doit concerner une annonce publiée par un agent");
  }
  return await prisma.rendezVous.create({ data });
};

export const getAllRdvs = async () => {
  return await prisma.rendezVous.findMany({
    include: { prospect: true, annonce: true },
  });
};

export const getRdvById = async (id: number) => {
  return await prisma.rendezVous.findUnique({
    where: { id },
    include: { prospect: true, annonce: true },
  });
};

export const updateRdv = async (id: number, data: UpdateRdvDto) => {
  return await prisma.rendezVous.update({
    where: { id },
    data,
  });
};

export const deleteRdv = async (id: number) => {
  return await prisma.rendezVous.delete({
    where: { id },
  });
};