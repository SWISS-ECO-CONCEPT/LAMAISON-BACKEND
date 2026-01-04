import { prisma } from "../utils/db";

export async function getAllUsersService() {
    try {
        return await prisma.user.findMany();
    } catch (error) {
        throw error;
    }
}



export async function getUserByIdService(userId: number) {
    try {
        return await prisma.user.findUnique({ where: { id: userId } });
    } catch (error) {
        throw error;
    }
}