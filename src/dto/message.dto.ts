// Pour créer un message
export interface CreateMessageDto {
  senderId: number;
  receiverId: number;
  content: string;
}

// Pour mettre à jour un message (ex: modifier contenu avant lecture)
export interface UpdateMessageDto {
  content?: string;
}
