import {prisma} from "../utils/db";
import { CreateMessageDto, UpdateMessageDto } from "../dto/message.dto";


// Créer un message
export const createMessage = async (data: CreateMessageDto) => {
  return await prisma.message.create({ data });
};

// Récupérer les messages entre deux users (conversation)
export const getConversation = async (userId1: number, userId2: number) => {
  return await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
};

// Récupérer tous les messages reçus par un user
export const getMessagesForUser = async (userId: number) => {
  return await prisma.message.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: "desc" },
  });
};

// Mettre à jour un message
export const updateMessage = async (id: number, data: UpdateMessageDto) => {
  return await prisma.message.update({
    where: { id },
    data,
  });
};

// Supprimer un message
export const deleteMessage = async (id: number) => {
  return await prisma.message.delete({ where: { id } });
};
