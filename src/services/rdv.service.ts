import { prisma } from "../utils/db";
import { CreateRdvDto, UpdateRdvDto } from "../dto/rdv.dto";

type RdvStatus = "EN_ATTENTE" | "PROPOSE" | "ACCEPTE" | "REFUSE" | "ANNULE";

const getRdvWithRelationsOrThrow = async (id: number): Promise<any> => {
  const rdv = await prisma.rendezVous.findUnique({
    where: { id },
    include: { prospect: true, annonce: { include: { proprietaire: true } } },
  });

  if (!rdv) {
    throw new Error("RDV non trouvé");
  }

  return rdv;
};

const getActorOrThrow = async (clerkId: string): Promise<any> => {
  const actor = await prisma.user.findUnique({ where: { clerkId } });
  if (!actor) {
    throw new Error("Utilisateur introuvable");
  }
  return actor;
};

const assertAgentOwnsRdv = (rdv: any, actorDbId: number) => {
  if (!rdv?.annonce?.proprietaireId || rdv.annonce.proprietaireId !== actorDbId) {
    throw new Error("Accès refusé: vous n'êtes pas l'agent de ce RDV");
  }
};

const assertProspectOwnsRdv = (rdv: any, actorDbId: number) => {
  if (!rdv?.prospectId || rdv.prospectId !== actorDbId) {
    throw new Error("Accès refusé: vous n'êtes pas le prospect de ce RDV");
  }
};

// Service de gestion des rendez-vous
export const createRdv = async (data: CreateRdvDto) => {
  // Vérifier que le user associé est bien un prospect
  const user = await prisma.user.findUnique({ where: { id: data.prospectId } });

  if (!user || user.role !== "PROSPECT") {
    throw new Error("Seul un prospect peut demander un RDV");
  }

  // Vérifier que l'annonce existe et appartient bien à un agent
  const annonce = await prisma.annonce.findUnique({
    where: { id: data.annonceId },
    include: { proprietaire: true },
  });

  if (!annonce || annonce.proprietaire.role !== "AGENT") {
    throw new Error("Le RDV doit concerner une annonce publiée par un agent");
  }

  // Set default status to EN_ATTENTE if not provided and ensure message is a string
  const rdvData = {
    ...data,
    status: (data.status || "EN_ATTENTE") as any,
    message: data.message ?? "",
  };

  return await prisma.rendezVous.create({
    data: rdvData as any,
    include: { prospect: true, annonce: { include: { proprietaire: true } } },
  });
};

export const getAllRdvs = async (filter?: { prospectId?: number; agentId?: number; annonceId?: number }) => {
  const where: any = {};

  if (filter?.prospectId) {
    where.prospectId = filter.prospectId;
  }

  if (filter?.annonceId) {
    where.annonceId = filter.annonceId;
  }

  // If agentId provided, we need to filter rdvs whose annonce.proprietaireId === agentId
  if (filter?.agentId) {
    return await prisma.rendezVous.findMany({
      where: {
        annonce: { proprietaireId: filter.agentId },
      },
      include: { prospect: true, annonce: { include: { proprietaire: true } } },
    });
  }

  return await prisma.rendezVous.findMany({
    where: where,
    include: { prospect: true, annonce: { include: { proprietaire: true } } },
  });
};

export const getRdvById = async (id: number) => {
  return await prisma.rendezVous.findUnique({
    where: { id },
    include: { prospect: true, annonce: { include: { proprietaire: true } } },
  });
};

export const updateRdv = async (id: number, data: UpdateRdvDto) => {
  return await prisma.rendezVous.update({
    where: { id },
    data: data as any,
  });
};

export const proposeRdv = async (id: number, actorClerkId: string, proposedDate: Date): Promise<any> => {
  const actor = await getActorOrThrow(actorClerkId);
  if (actor.role !== "AGENT") {
    throw new Error("Seul un agent peut proposer un créneau");
  }

  const rdv: any = await getRdvWithRelationsOrThrow(id);
  assertAgentOwnsRdv(rdv, actor.id);

  const status = rdv.status as RdvStatus;
  if (status !== "EN_ATTENTE" && status !== "PROPOSE") {
    throw new Error("Transition invalide");
  }

  return await prisma.rendezVous.update({
    where: { id },
    data: {
      status: "PROPOSE" as any,
      proposedDate,
    } as any,
    include: { prospect: true, annonce: { include: { proprietaire: true } } },
  });
};

export const acceptRdv = async (id: number, actorClerkId: string): Promise<any> => {
  const actor = await getActorOrThrow(actorClerkId);
  if (actor.role !== "AGENT") {
    throw new Error("Seul un agent peut accepter un RDV");
  }

  const rdv: any = await getRdvWithRelationsOrThrow(id);
  assertAgentOwnsRdv(rdv, actor.id);

  const status = rdv.status as RdvStatus;
  if (status !== "EN_ATTENTE") {
    throw new Error("Transition invalide");
  }

  return await prisma.rendezVous.update({
    where: { id },
    data: {
      status: "ACCEPTE" as any,
      proposedDate: null,
    } as any,
    include: { prospect: true, annonce: { include: { proprietaire: true } } },
  });
};

export const rejectRdv = async (id: number, actorClerkId: string): Promise<any> => {
  const actor = await getActorOrThrow(actorClerkId);
  if (actor.role !== "AGENT") {
    throw new Error("Seul un agent peut refuser un RDV");
  }

  const rdv: any = await getRdvWithRelationsOrThrow(id);
  assertAgentOwnsRdv(rdv, actor.id);

  const status = rdv.status as RdvStatus;
  if (status !== "EN_ATTENTE" && status !== "PROPOSE") {
    throw new Error("Transition invalide");
  }

  return await prisma.rendezVous.update({
    where: { id },
    data: {
      status: "REFUSE" as any,
      proposedDate: null,
    } as any,
    include: { prospect: true, annonce: { include: { proprietaire: true } } },
  });
};

export const acceptProposal = async (id: number, actorClerkId: string): Promise<any> => {
  const actor = await getActorOrThrow(actorClerkId);
  if (actor.role !== "PROSPECT") {
    throw new Error("Seul un prospect peut valider une proposition");
  }

  const rdv: any = await getRdvWithRelationsOrThrow(id);
  assertProspectOwnsRdv(rdv, actor.id);

  const status = rdv.status as RdvStatus;
  if (status !== "PROPOSE" || !rdv.proposedDate) {
    throw new Error("Transition invalide");
  }

  return await prisma.rendezVous.update({
    where: { id },
    data: {
      status: "ACCEPTE" as any,
      date: rdv.proposedDate,
      proposedDate: null,
    } as any,
    include: { prospect: true, annonce: { include: { proprietaire: true } } },
  });
};

export const rejectProposal = async (id: number, actorClerkId: string): Promise<any> => {
  const actor = await getActorOrThrow(actorClerkId);
  if (actor.role !== "PROSPECT") {
    throw new Error("Seul un prospect peut refuser une proposition");
  }

  const rdv: any = await getRdvWithRelationsOrThrow(id);
  assertProspectOwnsRdv(rdv, actor.id);

  const status = rdv.status as RdvStatus;
  if (status !== "PROPOSE") {
    throw new Error("Transition invalide");
  }

  return await prisma.rendezVous.update({
    where: { id },
    data: {
      status: "EN_ATTENTE" as any,
      proposedDate: null,
    } as any,
    include: { prospect: true, annonce: { include: { proprietaire: true } } },
  });
};

export const deleteRdv = async (id: number) => {
  return await prisma.rendezVous.delete({
    where: { id },
  });
};