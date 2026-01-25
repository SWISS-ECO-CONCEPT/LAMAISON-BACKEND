import { Router } from "express";
import { getAllUsersController, getUserByIdController } from "../controllers/adminUser.controller";
import { getAllAnnoncesController, getAnnonceByIdController, deleteAnnonceController } from "../controllers/adminAnnonce.controller";
import { getAllRendezVousController, getRendezVousByIdController, updateRendezVousStatusController, deleteRendezVousController } from "../controllers/adminRendezVous.controller";
import { getAllMessagesController, getMessageByIdController, deleteMessageController } from "../controllers/adminMessage.controller";
import { signInController, signUpController } from "../controllers/adminAuth.controller";
import { isAdmin } from "../middlewares/admin.middleware";

const adminRoutes = Router()

{/*admin authentification*/}
adminRoutes.post('/auth/signin', signInController)
adminRoutes.post('/auth/signup', signUpController)

{/*admin user management routes*/}
adminRoutes.get('/users', isAdmin, getAllUsersController )
adminRoutes.get('/users/:id', isAdmin, getUserByIdController)

{/*admin annonce management routes*/}
adminRoutes.get('/annonces', isAdmin, getAllAnnoncesController)
adminRoutes.get('/annonces/:id', isAdmin, getAnnonceByIdController)
adminRoutes.delete('/annonces/:id', isAdmin, deleteAnnonceController)

{/*admin rendez-vous management routes*/}
adminRoutes.get('/rdv', isAdmin, getAllRendezVousController)
adminRoutes.get('/rdv/:id', isAdmin, getRendezVousByIdController)
adminRoutes.patch('/rdv/:id/status', isAdmin, updateRendezVousStatusController)
adminRoutes.delete('/rdv/:id', isAdmin, deleteRendezVousController)

{/*admin message management routes*/}
adminRoutes.get('/messages', isAdmin, getAllMessagesController)
adminRoutes.get('/messages/:id', isAdmin, getMessageByIdController)
adminRoutes.delete('/messages/:id', isAdmin, deleteMessageController)

export default adminRoutes