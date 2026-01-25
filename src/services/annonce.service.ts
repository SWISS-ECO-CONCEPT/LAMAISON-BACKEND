import {prisma} from "../utils/db";
import { CreateAnnonceDto, UpdateAnnonceDto } from "../dto/annonce.dto";

export const createAnnonce = async (data: CreateAnnonceDto) => {
  return await prisma.annonce.create({ data });
};

export const getAllAnnonces = async (where: any = {}) => {
  return await prisma.annonce.findMany({
    where,
    include: { proprietaire: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAnnonceById = async (id: number) => {
  return await prisma.annonce.findUnique({ where: { id } });
};

export const updateAnnonce = async (id: number, data: UpdateAnnonceDto) => {
  return await prisma.annonce.update({
    where: { id },
    data,
  });
};

export const deleteAnnonce = async (id: number) => {
  return await prisma.annonce.delete({ where: { id } });
};

export const getAnnoncesByUser = async (clerkId: string, where: any = {}) => {
  return await prisma.annonce.findMany({
    where: {
      ...where,
      proprietaire: { clerkId },
    },
    include: { proprietaire: true },
    orderBy: { createdAt: 'desc' },
  });
};
