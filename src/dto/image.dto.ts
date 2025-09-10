// DTO pour créer une image
export interface CreateImageDto {
  annonceId: number; // l'annonce liée
}

// DTO pour mise à jour (optionnel si on veut changer le lien d'annonce)
export interface UpdateImageDto {
  annonceId?: number;
}
