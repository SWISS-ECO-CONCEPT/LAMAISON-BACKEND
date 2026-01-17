type TypeBien = "maison" | "appartement" | "terrain" | "chambre" | "meublé";
type ProjetType = "achat" | "location";

export interface CreateAnnonceDto {
  titre: string;
  description: string;
  prix: number;
  ville: string;
  proprietaireId: number;
  type?: TypeBien;
  projet?: ProjetType;
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
  projet?: ProjetType;
  surface?: number;
  chambres?: number;
  douches?: number;
  images?: string[];
}
