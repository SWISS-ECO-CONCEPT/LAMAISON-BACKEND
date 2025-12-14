import { Request, Response} from "express";
import { signIn, signUp, updateUserRole } from "../services/auth.services"
import { SignInDto, SignUpDto } from "../dto/auth.dto";

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

export async function updateUserRoleController (req:Request, res:Response) {
    try {
        const { clerkId, newRole } = req.body;
        
        if (!clerkId || !newRole) {
            res.status(400).json({error: "clerkId et newRole sont requis"});
            return;
        }

        const validRoles = [ "AGENT", "PROSPECT"];
        if (!validRoles.includes(newRole)) {
            res.status(400).json({error: "Le rôle doit être ADMIN, AGENT ou PROSPECT"});
            return;
        }

        const result = await updateUserRole(clerkId, newRole);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({error: error.message})
    }
}

export async function userClerkWebhook (req:Request, res:Response) {
    
}