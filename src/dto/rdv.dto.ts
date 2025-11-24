export interface CreateRdvDto {
  date: Date;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  message: string;
  status: "EN_ATTENTE" | "ACCEPTE" | "REFUSE" | "ANNULE";
  prospectId: number;  // l’utilisateur qui demande le RDV (prospect)
  annonceId: number;   // l’annonce liée au RDV
}

export interface UpdateRdvDto {
  date?: Date;
  status?: "EN_ATTENTE" | "ACCEPTE" | "REFUSE" | "ANNULE";
}
