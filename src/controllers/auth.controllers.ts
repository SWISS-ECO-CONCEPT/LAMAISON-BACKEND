import { Request, Response} from "express";
import { signIn, signUp, updateUserRole } from "../services/auth.services"
import { SignInDto, SignUpDto } from "../dto/auth.dto";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function signUpController (req:Request, res:Response) {
    try {
        const dto: SignUpDto= req.body
        // Le clerkId du body doit être celui du token : sinon n'importe qui
        // connaissant un clerkId pouvait obtenir le profil (et le JWT) d'un autre.
        const auth = req.auth();
        if (!auth?.userId || auth.userId !== dto?.clerkId) {
            return sendError(res, 403, "clerkId ne correspond pas à l'utilisateur connecté");
        }
        const result = await signUp(dto)
        return sendSuccess(res, result, 201)
    } catch (error: any) {
        return sendError(res, 400, error.message)
    }
}
export async function signInController (req:Request, res:Response) {
    try {
        const dto: SignInDto= req.body
        // Le clerkId du body doit être celui du token : sinon n'importe qui
        // connaissant un clerkId pouvait obtenir le profil (et le JWT) d'un autre.
        const auth = req.auth();
        if (!auth?.userId || auth.userId !== dto?.clerkId) {
            return sendError(res, 403, "clerkId ne correspond pas à l'utilisateur connecté");
        }
        const result = await signIn(dto)
        return sendSuccess(res, result, 201)
    } catch (error: any) {
        return sendError(res, 400, error.message)
    }
}

export async function updateUserRoleController (req:Request, res:Response) {
    try {
        const { clerkId, newRole } = req.body;

        if (!clerkId || !newRole) {
            return sendError(res, 400, "clerkId et newRole sont requis");
        }

        // On ne peut changer QUE son propre rôle — sinon n'importe quel compte
        // connecté aurait pu promouvoir/rétrograder n'importe quel autre utilisateur
        // juste en connaissant son clerkId.
        const auth = req.auth();
        if (!auth?.userId || auth.userId !== clerkId) {
            return sendError(res, 403, "Vous ne pouvez modifier que votre propre rôle");
        }

        const validRoles = [ "AGENT", "PROSPECT"];
        if (!validRoles.includes(newRole)) {
            return sendError(res, 400, "Le rôle doit être ADMIN, AGENT ou PROSPECT");
        }

        const result = await updateUserRole(clerkId, newRole);
        return sendSuccess(res, result);
    } catch (error: any) {
        return sendError(res, 400, error.message)
    }
}
export async function userClerkWebhook (req:Request, res:Response) {

}