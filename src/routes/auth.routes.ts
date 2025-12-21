import { Request, Response, Router } from "express";
import { prisma } from "../utils/db";
import { signInController, signUpController, updateUserRoleController } from "../controllers/auth.controllers";
import { requireAuth } from "@clerk/express";


const userRouter = Router();

userRouter.post('/signup', signUpController)
userRouter.post('/signin', signInController)
userRouter.put('/update-role', updateUserRoleController)

userRouter.get('/me', requireAuth(), async (req: Request, res: Response) => {
    try {
        const clerkId = (req as any).auth?.userId as string | undefined;
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

userRouter.get('/users', async (req: Request, res: Response) => {
    const user = await prisma.user.findMany()
    res.status(200).json(user)
})

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



