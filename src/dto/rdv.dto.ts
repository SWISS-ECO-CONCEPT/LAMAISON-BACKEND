export interface CreateRdvDto {
  date: Date;
  prospectId: number;  // l’utilisateur qui demande le RDV (prospect)
  annonceId: number;   // l’annonce liée au RDV
}

export interface UpdateRdvDto {
  date?: Date;
  status?: "EN_ATTENTE" | "ACCEPTE" | "REFUSE" | "ANNULE";
}
