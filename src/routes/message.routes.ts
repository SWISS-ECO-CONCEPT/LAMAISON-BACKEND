import { Router } from "express";
import { createMessage, getConversation } from "../controllers/message.controller";

const router = Router();

router.post("/", createMessage);
router.get("/:userId1/:userId2", getConversation);

export default router;
