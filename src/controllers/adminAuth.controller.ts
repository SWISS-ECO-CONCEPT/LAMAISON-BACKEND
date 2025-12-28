import { Request, Response} from "express";
import { signIn, signUp } from "../services/adminAuth.service"
import { SignInDto, SignUpDto } from "../dto/adminAuth.dto";

export async function signUpController (req:Request, res:Response) {
    try {
        const dto: SignUpDto= req.body
        const result = await signUp(dto)
        res.status(201).json(result)
    } catch (error: any) {
        res.status(400).json({error: error.message})
    }
}
export async function signInController (req:Request, res:Response) {
    try {
        const dto: SignInDto= req.body
        const result = await signIn(dto)
        res.status(201).json(result)
    } catch (error: any) {
        res.status(400).json({error: error.message})
    }
}