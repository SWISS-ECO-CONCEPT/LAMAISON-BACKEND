import { Request, Response, Router } from "express";
import { prisma } from "../utils/db";
import { signInController, signUpController, updateUserRoleController } from "../controllers/auth.controllers";
import { requireAuth } from "@clerk/express";
import { sendSuccess, sendError } from "../utils/apiResponse";


const userRouter = Router();

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Compte créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
userRouter.post('/signup', signUpController)

/**
 * @openapi
 * /auth/signin:
 *   post:
 *     summary: Connexion
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
userRouter.post('/signin', signInController)
// requireAuth() ajouté : sans lui, n'importe qui pouvait changer le rôle de
// n'importe quel utilisateur (voir la vérification d'identité dans le contrôleur).

/**
 * @openapi
 * /auth/update-role:
 *   put:
 *     summary: Changer son propre rôle (AGENT ou PROSPECT)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clerkId, newRole]
 *             properties:
 *               clerkId:
 *                 type: string
 *               newRole:
 *                 type: string
 *                 enum: [AGENT, PROSPECT]
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       403:
 *         description: Ne peut modifier que son propre rôle
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
userRouter.put('/update-role', requireAuth(), updateUserRoleController)

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: Utilisateur introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
userRouter.get('/me', requireAuth(), async (req: Request, res: Response) => {
    try {
        const auth = req.auth();
        const clerkId = auth?.userId;
        if (!clerkId) {
            return sendError(res, 401, "Non authentifié");
        }

        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            return sendError(res, 404, "Utilisateur introuvable");
        }

        return sendSuccess(res, user);
    } catch (e: any) {
        return sendError(res, 500, "Erreur lors de la récupération du profil", undefined, e);
    }
});

// Route GET /users supprimée : elle exposait la liste complète des utilisateurs
// (clerkId compris) sans aucune authentification, et n'était appelée nulle part
// dans le frontend ni l'admin — code mort et dangereux, donc retiré plutôt que
// simplement protégé.

/**
 * @openapi
 * /auth/user/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son id interne
 *     tags: [Auth]
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
 *         description: Utilisateur trouvé (champs limités)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
userRouter.get('/user/:id', requireAuth(), async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.params.id) },
            select: {
                id: true,
                clerkId: true,
                firstname: true,
                role: true,
                avatar: true,
            }
        });
        if (!user) return sendError(res, 404, "Utilisateur non trouvé");
        return sendSuccess(res, user);
    } catch (e: any) {
        return sendError(res, 500, "Erreur serveur", undefined, e);
    }
});

export default userRouter