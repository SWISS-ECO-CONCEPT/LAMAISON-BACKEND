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
adminRoutes.get('/users',  getAllUsersController )
adminRoutes.get('/users/:id',  getUserByIdController)

{/*admin annonce management routes*/}
adminRoutes.get('/annonces',  getAllAnnoncesController)
adminRoutes.get('/annonces/:id', getAnnonceByIdController)
adminRoutes.delete('/annonces/:id',  deleteAnnonceController)

{/*admin rendez-vous management routes*/}
adminRoutes.get('/rdv',  getAllRendezVousController)
adminRoutes.get('/rdv/:id',  getRendezVousByIdController)
adminRoutes.patch('/rdv/:id/status', updateRendezVousStatusController)
adminRoutes.delete('/rdv/:id',  deleteRendezVousController)

{/*admin message management routes*/}
adminRoutes.get('/messages',  getAllMessagesController)
adminRoutes.get('/messages/:id',  getMessageByIdController)
adminRoutes.delete('/messages/:id', deleteMessageController)

export default adminRoutes