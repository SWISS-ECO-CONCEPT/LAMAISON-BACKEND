import { Request, Response} from "express";
import { signIn, signUp } from "../services/adminAuth.service"
import { SignInDto, SignUpDto } from "../dto/adminAuth.dto";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function signUpController (req:Request, res:Response) {
    try {
        const dto: SignUpDto= req.body
        const result = await signUp(dto)
        return sendSuccess(res, result, 201)
    } catch (error: any) {
        return sendError(res, 400, error.message)
    }
}
export async function signInController (req:Request, res:Response) {
    try {
        const dto: SignInDto= req.body
        const result = await signIn(dto)
        return sendSuccess(res, result, 201)
    } catch (error: any) {
        return sendError(res, 400, error.message)
    }
}