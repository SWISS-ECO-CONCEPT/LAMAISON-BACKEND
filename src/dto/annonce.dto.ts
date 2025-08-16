export interface CreateAnnonceDto {
  titre: string;
  description: string;
  prix: number;
  ville: string;
}

export interface UpdateAnnonceDto {
  titre?: string;
  description?: string;
  prix?: number;
  ville?: string;
}
