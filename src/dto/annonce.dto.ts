type TypeBien = "maison" | "appartement" | "terrain";

export interface CreateAnnonceDto {
  titre: string;
  description: string;
  prix: number;
  ville: string;
  proprietaireId: number; // Obligatoire car relation avec User
  type?: TypeBien;
  surface?: number;
  chambres?: number;
  douches?: number;
  images: string[];
}

export interface UpdateAnnonceDto {
  titre?: string;
  description?: string;
  prix?: number;
  ville?: string;
  type?: TypeBien;
  surface?: number;
  chambres?: number;
  douches?: number;
  images?: string[];
}
