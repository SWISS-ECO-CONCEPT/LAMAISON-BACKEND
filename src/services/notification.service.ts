export const notifyAgentNewRdv = async (rdv: any) => {
  console.log(`[Notification] Agent ${rdv.agent?.clerkId || rdv.agentId} notified about new RDV ${rdv.id}`);
  return Promise.resolve({ success: true });
};

export const notifyProspectRdvStatusChange = async (rdv: any) => {
  console.log(`[Notification] Prospect ${rdv.prospect?.clerkId || rdv.prospectId} notified about RDV ${rdv.id} status ${rdv.status}`);
  return Promise.resolve({ success: true });
};
