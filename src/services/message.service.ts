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

/**
 * Get or create a conversation between two users by their clerkIds
 * Returns the user IDs to use for messaging
 */
export const getOrCreateConversation = async (
  clerkId1: string,
  clerkId2: string,
  rdvId?: number
) => {
  try {
    // Get users by clerkId
    const user1 = await prisma.user.findUnique({
      where: { clerkId: clerkId1 },
    });

    const user2 = await prisma.user.findUnique({
      where: { clerkId: clerkId2 },
    });

    if (!user1 || !user2) {
      throw new Error("One or both users not found");
    }

    // Check if conversation already exists (any message between them)
    const existingConversation = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: user1.id, receiverId: user2.id },
          { senderId: user2.id, receiverId: user1.id },
        ],
      },
    });

    // Return the user IDs for creating messages
    return {
      senderId: user1.id,
      receiverId: user2.id,
      clerkId1,
      clerkId2,
      rdvId,
      conversationExists: !!existingConversation,
    };
  } catch (error) {
    console.error("Error getting or creating conversation:", error);
    throw error;
  }
};
