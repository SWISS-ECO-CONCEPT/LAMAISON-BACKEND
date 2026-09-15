import { Router } from "express";
import { getAllUsersController, getUserByIdController } from "../controllers/adminUser.controller";
import { getAllAnnoncesController, getAnnonceByIdController, deleteAnnonceController } from "../controllers/adminAnnonce.controller";
import { getAllRendezVousController, getRendezVousByIdController, updateRendezVousStatusController, deleteRendezVousController } from "../controllers/adminRendezVous.controller";
import { getAllMessagesController, getMessageByIdController, deleteMessageController } from "../controllers/adminMessage.controller";
import { signInController, signUpController } from "../controllers/adminAuth.controller";
import { isAdmin } from "../middlewares/admin.middleware";

const adminRoutes = Router()

{/*admin authentification*/}
// Ces deux routes DOIVENT rester publiques : c'est justement elles qui délivrent
// le token — impossible d'exiger un token admin pour... obtenir un token admin.

/**
 * @openapi
 * /admin/auth/signin:
 *   post:
 *     summary: Connexion admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Connexion réussie, token admin renvoyé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.post('/auth/signin', signInController)

/**
 * @openapi
 * /admin/auth/signup:
 *   post:
 *     summary: Créer un compte admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Compte admin créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.post('/auth/signup', signUpController)

// Toutes les routes ci-dessous exigent maintenant isAdmin : avant ce correctif,
// n'importe qui pouvait lister/supprimer utilisateurs, annonces, RDV et messages
// sans la moindre authentification.

{/*admin user management routes*/}

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Lister tous les utilisateurs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       403:
 *         description: Accès non autorisé - Administrateur requis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
adminRoutes.get('/users',  isAdmin, getAllUsersController )

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.get('/users/:id',  isAdmin, getUserByIdController)

{/*admin annonce management routes*/}

/**
 * @openapi
 * /admin/annonces:
 *   get:
 *     summary: Lister toutes les annonces
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des annonces
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.get('/annonces',  isAdmin, getAllAnnoncesController)

/**
 * @openapi
 * /admin/annonces/{id}:
 *   get:
 *     summary: Récupérer une annonce par id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annonce trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.get('/annonces/:id', isAdmin, getAnnonceByIdController)

/**
 * @openapi
 * /admin/annonces/{id}:
 *   delete:
 *     summary: Supprimer une annonce
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annonce supprimée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.delete('/annonces/:id',  isAdmin, deleteAnnonceController)

{/*admin rendez-vous management routes*/}

/**
 * @openapi
 * /admin/rdv:
 *   get:
 *     summary: Lister tous les rendez-vous
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des RDV
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.get('/rdv',  isAdmin, getAllRendezVousController)

/**
 * @openapi
 * /admin/rdv/{id}:
 *   get:
 *     summary: Récupérer un rendez-vous par id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: RDV trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.get('/rdv/:id',  isAdmin, getRendezVousByIdController)

/**
 * @openapi
 * /admin/rdv/{id}/status:
 *   patch:
 *     summary: Modifier le statut d'un rendez-vous
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.patch('/rdv/:id/status', isAdmin, updateRendezVousStatusController)

/**
 * @openapi
 * /admin/rdv/{id}:
 *   delete:
 *     summary: Supprimer un rendez-vous
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: RDV supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.delete('/rdv/:id',  isAdmin, deleteRendezVousController)

{/*admin message management routes*/}

/**
 * @openapi
 * /admin/messages:
 *   get:
 *     summary: Lister tous les messages
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.get('/messages',  isAdmin, getAllMessagesController)

/**
 * @openapi
 * /admin/messages/{id}:
 *   get:
 *     summary: Récupérer un message par id
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.get('/messages/:id',  isAdmin, getMessageByIdController)

/**
 * @openapi
 * /admin/messages/{id}:
 *   delete:
 *     summary: Supprimer un message
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
adminRoutes.delete('/messages/:id', isAdmin, deleteMessageController)

export default adminRoutes