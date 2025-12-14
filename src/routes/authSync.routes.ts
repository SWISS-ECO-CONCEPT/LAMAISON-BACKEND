import { Request, Response, Router } from "express";
import { Webhook } from "svix"; // Clerk utilise svix pour signer les events
import {prisma} from "../utils/db";

const router = Router();

// Clerk Webhook
router.post("/webhooks/clerk", async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET as string;

  const payload = req.body;
  const headers = req.headers;

  // Vérifier la signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;
  try {
    evt = wh.verify(JSON.stringify(payload), headers as any);
  } catch (err) {
    console.error("❌ Erreur vérification webhook:", err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  const { type, data } = evt;

  try {
    if (type === "user.created") {
      await prisma.user.create({
        data: {
          clerkId: data.id,
          firstname: data.first_name,
        //   email: data.email_addresses[0].email_address,
          role:data.unsafe_metadata?.role ||"PROSPECT", // rôle par défaut
        },
      });
    }

    if (type === "user.updated") {
      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          firstname: data.first_name,
        //   email: data.email_addresses[0].email_address,
        },
      });
    }

    if (type === "user.deleted") {
      await prisma.user.delete({
        where: { clerkId: data.id },
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Erreur Prisma:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;