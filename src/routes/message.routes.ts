import { Router } from "express";
import { createMessage, getConversation, initiateMessaging, getOrCreateConversation, getUserConversations } from "../controllers/message.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/", requireAuth(), getUserConversations);
router.post("/", createMessage);
router.get("/:userId1/:userId2", getConversation);

// New endpoints for auto-messaging system
router.post("/initiate", requireAuth(), initiateMessaging);
router.get("/conversation", getOrCreateConversation);

export default router;
