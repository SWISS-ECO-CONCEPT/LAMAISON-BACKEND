export interface CreateAnnonceDto {
  titre: string;
  description: string;
  prix: number;
  ville: string;
   proprietaireId: number; // Obligatoire car relation avec User
}

export interface UpdateAnnonceDto {
  titre?: string;
  description?: string;
  prix?: number;
  ville?: string;
}
