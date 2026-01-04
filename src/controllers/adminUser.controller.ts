import { Request, Response } from "express";
import { getAllUsersService, getUserByIdService } from "../services/adminUser.service";



export async function getAllUsersController(req: Request, res: Response) {
    try {
        const users = await getAllUsersService();
        return res.status(200).json({data: users});
    } catch (error) {
        throw error
    }
}

export async function getUserByIdController(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.id, 10);
        const user = await getUserByIdService(userId);
        return res.status(200).json({data: user});
    } catch (error) {
        throw error
    
    }
}