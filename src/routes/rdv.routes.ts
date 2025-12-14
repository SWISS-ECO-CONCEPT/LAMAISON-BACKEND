import {Router} from "express"
import * as rdvController from "../controllers/rdv.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

router.post("/", requireAuth(), rdvController.createRdv);
router.get("/", rdvController.getAllRdvs);
router.get("/:id", rdvController.getRdvById);
router.patch("/:id", requireAuth(), rdvController.updateRdv);
router.delete("/:id", requireAuth(), rdvController.deleteRdv);

router.post("/:id/propose", requireAuth(), rdvController.proposeRdv);
router.post("/:id/accept", requireAuth(), rdvController.acceptRdv);
router.post("/:id/reject", requireAuth(), rdvController.rejectRdv);
router.post("/:id/proposal/accept", requireAuth(), rdvController.acceptProposal);
router.post("/:id/proposal/reject", requireAuth(), rdvController.rejectProposal);

export default router;