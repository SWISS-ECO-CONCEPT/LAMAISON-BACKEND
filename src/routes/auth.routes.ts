import { Request, Response, Router } from "express";
import { prisma } from "../utils/db";
import { signInController, signUpController, updateUserRoleController } from "../controllers/auth.controllers";
import { requireAuth } from "@clerk/express";


const userRouter = Router();

userRouter.post('/signup', signUpController)
userRouter.post('/signin', signInController)
// requireAuth() ajouté : sans lui, n'importe qui pouvait changer le rôle de
// n'importe quel utilisateur (voir la vérification d'identité dans le contrôleur).
userRouter.put('/update-role', requireAuth(), updateUserRoleController)

userRouter.get('/me', requireAuth(), async (req: Request, res: Response) => {
    try {
        const auth = req.auth();
        const clerkId = auth?.userId;
        if (!clerkId) {
            return res.status(401).json({ message: "Non authentifié" });
        }

        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ message: "Erreur lors de la récupération du profil", error: e });
    }
});

// Route GET /users supprimée : elle exposait la liste complète des utilisateurs
// (clerkId compris) sans aucune authentification, et n'était appelée nulle part
// dans le frontend ni l'admin — code mort et dangereux, donc retiré plutôt que
// simplement protégé.

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
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ message: "Erreur serveur", error: e });
    }
});

export default userRouter