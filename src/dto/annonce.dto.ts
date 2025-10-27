export interface CreateAnnonceDto {
  titre: string;
  description: string;
  prix: number;
  ville: string;
  proprietaireId: number; // Obligatoire car relation avec User
  type?: 'maison' | 'appartement' | 'terrain' | 'chambre' | 'meublé' | string;
  surface?: number;
  chambres?: number;
  douches?: number;
   images?: any[];
}

export interface UpdateAnnonceDto {
  titre?: string;
  description?: string;
  prix?: number;
  ville?: string;
  type?: string;
  surface?: number;
  chambres?: number;
  douches?: number;
  images?: any[];
}
