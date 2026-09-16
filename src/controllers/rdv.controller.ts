import { Request, Response } from "express";
import * as rdvService from "../services/rdv.service";
import { getDbUserIdByClerkId } from "../services/auth.services";
import * as messageService from "../services/message.service";
import { prisma } from "../utils/db";
import { sendSuccess, sendError } from "../utils/apiResponse";

//  POST /api/rdvs
export const createRdv = async (req: Request, res: Response) => {
  try {
    const payload = { ...req.body } as any;
    const auth = req.auth();
    const actorClerkId = auth?.userId as string | undefined;
    if (!actorClerkId) {
      return sendError(res, 401, "Non authentifié");
    }

    if (payload.prospectClerkId && payload.prospectClerkId !== actorClerkId) {
      return sendError(res, 403, "Accès refusé");
    }

    if (!payload.prospectClerkId) {
      payload.prospectClerkId = actorClerkId;
    }

    if (payload.prospectClerkId) {
      const dbId = await getDbUserIdByClerkId(payload.prospectClerkId as string);
      if (!dbId) {
        return sendError(res, 404, "Utilisateur Clerk introuvable dans la base.(clerkId)");
      }
      payload.prospectId = dbId;
    }

    delete payload.prospectClerkId;
    delete payload.proprietaireId;

    const rdv: any = await rdvService.createRdv(payload);

    try {
      const io = req.app.get('io');
      if (io && rdv?.annonce?.proprietaire?.clerkId) {
        io.emit('rdv_update', {
          type: 'rdv_request',
          rdvId: rdv.id,
          agentClerkId: rdv.annonce.proprietaire.clerkId,
          prospectClerkId: rdv.prospect?.clerkId,
          status: rdv.status,
        });
      }
    } catch (e) {
      // best-effort
    }

    return sendSuccess(res, rdv, 201);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de la création", undefined, error);
  }
};

//  GET /api/rdvs
export const getAllRdvs = async (req: Request, res: Response) => {
  try {
    const { prospectClerkId, agentClerkId, annonceId } = req.query as any;
    let filter: any = {};

    if (prospectClerkId) {
      const dbId = await getDbUserIdByClerkId(prospectClerkId as string);
      if (!dbId) return sendError(res, 400, "Utilisateur Clerk introuvable dans la base.(prospectClerkId)");
      filter.prospectId = dbId;
    }

    if (agentClerkId) {
      const dbId = await getDbUserIdByClerkId(agentClerkId as string);
      if (!dbId) return sendError(res, 400, "Utilisateur Clerk introuvable dans la base.(agentClerkId)");
      filter.agentId = dbId;
    }

    if (annonceId) {
      filter.annonceId = Number(annonceId);
    }

    const rdvs = await rdvService.getAllRdvs(filter);
    return sendSuccess(res, rdvs);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de la récupération", undefined, error);
  }
};

//  GET /api/rdvs/:id
export const getRdvById = async (req: Request, res: Response) => {
  try {
    const rdv = await rdvService.getRdvById(Number(req.params.id));
    if (!rdv) return sendError(res, 404, "RDV non trouvé");
    return sendSuccess(res, rdv);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de la récupération", undefined, error);
  }
};

//  PATCH /api/rdvs/:id
export const updateRdv = async (req: Request, res: Response) => {
  try {
    const auth = req.auth();
    const actorClerkId = auth?.userId as string | undefined;
    if (!actorClerkId) {
      return sendError(res, 401, "Non authentifié");
    }

    const id = Number(req.params.id);
    const { status, proposedDate } = req.body as any;

    const actor = await prisma.user.findUnique({ where: { clerkId: actorClerkId } });
    if (!actor) {
      return sendError(res, 404, "Utilisateur introuvable");
    }

    if (status === 'ACCEPTE') {
      const updated: any = actor.role === 'PROSPECT'
        ? await rdvService.acceptProposal(id, actorClerkId)
        : await rdvService.acceptRdv(id, actorClerkId);

      if (updated?.prospect?.clerkId && updated?.annonce?.proprietaire?.clerkId) {
        if (actor.role === 'PROSPECT') {
          await sendAutoMessage(
            updated.prospect.clerkId,
            updated.annonce.proprietaire.clerkId,
            updated.id,
            `Bonjour, j'accepte votre proposition de créneau.`
          );
        } else {
          await sendAutoMessage(
            updated.annonce.proprietaire.clerkId,
            updated.prospect.clerkId,
            updated.id,
            `Bonjour, votre demande de RDV a été acceptée.`
          );
        }
      }

      emitRdvUpdate(req, {
        type: actor.role === 'PROSPECT' ? 'proposal_accepted' : 'rdv_accepted',
        rdvId: updated.id,
        status: updated.status,
        prospectClerkId: updated.prospect?.clerkId,
        agentClerkId: updated.annonce?.proprietaire?.clerkId,
      });

      return sendSuccess(res, updated);
    }
    if (status === 'REFUSE') {
      const updated: any = await rdvService.rejectRdv(id, actorClerkId);

      if (updated?.prospect?.clerkId && updated?.annonce?.proprietaire?.clerkId) {
        await sendAutoMessage(
          updated.annonce.proprietaire.clerkId,
          updated.prospect.clerkId,
          updated.id,
          `Bonjour, votre demande de RDV a été refusée.`
        );
      }

      emitRdvUpdate(req, {
        type: 'rdv_rejected',
        rdvId: updated.id,
        status: updated.status,
        prospectClerkId: updated.prospect?.clerkId,
        agentClerkId: updated.annonce?.proprietaire?.clerkId,
      });

      return sendSuccess(res, updated);
    }
    if (status === 'PROPOSE') {
      if (!proposedDate) {
        return sendError(res, 400, "proposedDate requis");
      }
      const updated: any = await rdvService.proposeRdv(id, actorClerkId, new Date(proposedDate));

      if (updated?.prospect?.clerkId && updated?.annonce?.proprietaire?.clerkId) {
        const formattedDate = updated.proposedDate ? new Date(updated.proposedDate).toLocaleString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '';

        await sendAutoMessage(
          updated.annonce.proprietaire.clerkId,
          updated.prospect.clerkId,
          updated.id,
          `Bonjour, je vous propose un nouveau créneau pour votre RDV : ${formattedDate}. Merci de consulter cette messagerie pour échanger à ce sujet ou valider la proposition.`
        );
      }

      emitRdvUpdate(req, {
        type: 'rdv_proposed',
        rdvId: updated.id,
        status: updated.status,
        prospectClerkId: updated.prospect?.clerkId,
        agentClerkId: updated.annonce?.proprietaire?.clerkId,
        proposedDate: updated.proposedDate,
      });

      return sendSuccess(res, updated);
    }
    if (status === 'EN_ATTENTE') {
      const updated: any = await rdvService.rejectProposal(id, actorClerkId);

      if (updated?.prospect?.clerkId && updated?.annonce?.proprietaire?.clerkId) {
        await sendAutoMessage(
          updated.prospect.clerkId,
          updated.annonce.proprietaire.clerkId,
          updated.id,
          `Bonjour, je refuse ce créneau. Pouvez-vous m'en proposer un autre ?`
        );
      }

      emitRdvUpdate(req, {
        type: 'proposal_rejected',
        rdvId: updated.id,
        status: updated.status,
        prospectClerkId: updated.prospect?.clerkId,
        agentClerkId: updated.annonce?.proprietaire?.clerkId,
      });

      return sendSuccess(res, updated);
    }

    const rdv = await rdvService.updateRdv(id, req.body);
    return sendSuccess(res, rdv);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de la mise à jour", undefined, error);
  }
};

async function sendAutoMessage(senderClerkId: string, recipientClerkId: string, rdvId: number, initialMessage: string) {
  const conversation = await messageService.getOrCreateConversation(senderClerkId, recipientClerkId, rdvId);
  await messageService.createMessage({
    senderId: conversation.senderId,
    receiverId: conversation.receiverId,
    content: initialMessage,
  });
}

function emitRdvUpdate(req: Request, payload: Record<string, unknown>) {
  try {
    const io = req.app.get('io');
    if (io) {
      io.emit('rdv_update', payload);
    }
  } catch (e) {
    // best-effort
  }
}

export const proposeRdv = async (req: Request, res: Response) => {
  try {
    const auth = req.auth();
    const actorClerkId = auth?.userId as string | undefined;
    if (!actorClerkId) return sendError(res, 401, "Non authentifié");

    const id = Number(req.params.id);
    const { proposedDate } = req.body as any;
    if (!proposedDate) {
      return sendError(res, 400, "proposedDate requis");
    }

    const updated: any = await rdvService.proposeRdv(id, actorClerkId, new Date(proposedDate));

    if (updated?.prospect?.clerkId && updated?.annonce?.proprietaire?.clerkId) {
      const formattedDate = updated.proposedDate ? new Date(updated.proposedDate).toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : '';

      await sendAutoMessage(
        updated.annonce.proprietaire.clerkId,
        updated.prospect.clerkId,
        updated.id,
        `Bonjour, je vous propose un nouveau créneau pour votre RDV : ${formattedDate}. Merci de consulter cette messagerie pour échanger à ce sujet ou valider la proposition.`
      );
    }

    emitRdvUpdate(req, {
      type: 'rdv_proposed',
      rdvId: updated.id,
      status: updated.status,
      prospectClerkId: updated.prospect?.clerkId,
      agentClerkId: updated.annonce?.proprietaire?.clerkId,
      proposedDate: updated.proposedDate,
    });

    return sendSuccess(res, updated);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de la proposition", undefined, error);
  }
};

export const acceptRdv = async (req: Request, res: Response) => {
  try {
    const auth = req.auth();
    const actorClerkId = auth?.userId as string | undefined;
    if (!actorClerkId) return sendError(res, 401, "Non authentifié");

    const id = Number(req.params.id);
    const updated: any = await rdvService.acceptRdv(id, actorClerkId);

    if (updated?.prospect?.clerkId && updated?.annonce?.proprietaire?.clerkId) {
      await sendAutoMessage(
        updated.annonce.proprietaire.clerkId,
        updated.prospect.clerkId,
        updated.id,
        `Bonjour, votre demande de RDV a été acceptée.`
      );
    }

    emitRdvUpdate(req, {
      type: 'rdv_accepted',
      rdvId: updated.id,
      status: updated.status,
      prospectClerkId: updated.prospect?.clerkId,
      agentClerkId: updated.annonce?.proprietaire?.clerkId,
    });

    return sendSuccess(res, updated);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de l'acceptation", undefined, error);
  }
};

export const rejectRdv = async (req: Request, res: Response) => {
  try {
    const auth = req.auth();
    const actorClerkId = auth?.userId as string | undefined;
    if (!actorClerkId) return sendError(res, 401, "Non authentifié");

    const id = Number(req.params.id);
    const updated: any = await rdvService.rejectRdv(id, actorClerkId);

    if (updated?.prospect?.clerkId && updated?.annonce?.proprietaire?.clerkId) {
      await sendAutoMessage(
        updated.annonce.proprietaire.clerkId,
        updated.prospect.clerkId,
        updated.id,
        `Bonjour, votre demande de RDV a été refusée.`
      );
    }

    emitRdvUpdate(req, {
      type: 'rdv_rejected',
      rdvId: updated.id,
      status: updated.status,
      prospectClerkId: updated.prospect?.clerkId,
      agentClerkId: updated.annonce?.proprietaire?.clerkId,
    });

    return sendSuccess(res, updated);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors du refus", undefined, error);
  }
};

export const acceptProposal = async (req: Request, res: Response) => {
  try {
    const auth = req.auth();
    const actorClerkId = auth?.userId as string | undefined;
    if (!actorClerkId) return sendError(res, 401, "Non authentifié");

    const id = Number(req.params.id);
    const updated: any = await rdvService.acceptProposal(id, actorClerkId);

    if (updated?.prospect?.clerkId && updated?.annonce?.proprietaire?.clerkId) {
      await sendAutoMessage(
        updated.prospect.clerkId,
        updated.annonce.proprietaire.clerkId,
        updated.id,
        `Bonjour, j'accepte votre proposition de créneau.`
      );
    }

    emitRdvUpdate(req, {
      type: 'proposal_accepted',
      rdvId: updated.id,
      status: updated.status,
      prospectClerkId: updated.prospect?.clerkId,
      agentClerkId: updated.annonce?.proprietaire?.clerkId,
    });

    return sendSuccess(res, updated);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de la validation de proposition", undefined, error);
  }
};

export const rejectProposal = async (req: Request, res: Response) => {
  try {
    const auth = req.auth();
    const actorClerkId = auth?.userId as string | undefined;
    if (!actorClerkId) return sendError(res, 401, "Non authentifié");

    const id = Number(req.params.id);
    const updated: any = await rdvService.rejectProposal(id, actorClerkId);

    if (updated?.prospect?.clerkId && updated?.annonce?.proprietaire?.clerkId) {
      await sendAutoMessage(
        updated.prospect.clerkId,
        updated.annonce.proprietaire.clerkId,
        updated.id,
        `Bonjour, je refuse ce créneau. Pouvez-vous m'en proposer un autre ?`
      );
    }

    emitRdvUpdate(req, {
      type: 'proposal_rejected',
      rdvId: updated.id,
      status: updated.status,
      prospectClerkId: updated.prospect?.clerkId,
      agentClerkId: updated.annonce?.proprietaire?.clerkId,
    });

    return sendSuccess(res, updated);
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors du refus de proposition", undefined, error);
  }
};

// DELETE /api/rdvs/:id
export const deleteRdv = async (req: Request, res: Response) => {
  try {
    const auth = req.auth();
    const actorClerkId = auth?.userId as string | undefined;
    if (!actorClerkId) {
      return sendError(res, 401, "Non authentifié");
    }

    await rdvService.deleteRdv(Number(req.params.id), actorClerkId);
    return sendSuccess(res, { id: Number(req.params.id) }, 200, "RDV supprimé");
  } catch (error: any) {
    return sendError(res, 500, "Erreur lors de la suppression", undefined, error);
  }
};