import { Router } from "express";
import { createMessage, getConversation, initiateMessaging, getOrCreateConversation, getUserConversations } from "../controllers/message.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/", requireAuth(), getUserConversations);
router.post("/", requireAuth(),createMessage);
router.get("/:userId1/:userId2", requireAuth(), getConversation);

// New endpoints for auto-messaging system
router.post("/initiate", requireAuth(), initiateMessaging);
router.get("/conversation", requireAuth(), getOrCreateConversation);

export default router;
