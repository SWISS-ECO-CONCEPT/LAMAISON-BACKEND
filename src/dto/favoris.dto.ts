// Ajouter un favori
export interface CreateFavoriDTO {
  annonceId: number;
}

// Réponse d’un favori
export interface FavoriResponseDTO {
  id: number;
  annonceId: number;
  userId: number;
  createdAt: Date;
}
