import { prisma } from "../utils/db";

export async function getAllMessagesService() {
    try {
        return await prisma.message.findMany({
            include: {
                sender: true,
                receiver: true
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function getMessageByIdService(messageId: number) {
    try {
        return await prisma.message.findUnique({
            where: { id: messageId },
            include: {
                sender: true,
                receiver: true
            }
        });
    } catch (error) {
        throw error;
    }
}

export async function deleteMessageService(messageId: number) {
    try {
        return await prisma.message.delete({
            where: { id: messageId }
        });
    } catch (error) {
        throw error;
    }
}
