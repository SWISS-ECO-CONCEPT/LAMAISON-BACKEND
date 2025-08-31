import {Router} from "express"
import * as rdvController from "../controllers/rdv.controller";

const router = Router();

router.post("/", rdvController.createRdv);
router.get("/", rdvController.getAllRdvs);
router.get("/:id", rdvController.getRdvById);
router.patch("/:id", rdvController.updateRdv);
router.delete("/:id", rdvController.deleteRdv);

export default router;