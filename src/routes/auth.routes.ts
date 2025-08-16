import { Request, Response, Router } from "express";
import prisma from "../utils/db";
import { signInController, signUpController } from "../controllers/auth.controllers";


const userRouter = Router();

userRouter.post('/signup', signUpController )
userRouter.post('/signin', signInController )

userRouter.get('/users', async(req:Request, res:Response)=>{
    const user= await prisma.user.findMany()
    res.status(200).json(user)
})

export default userRouter



