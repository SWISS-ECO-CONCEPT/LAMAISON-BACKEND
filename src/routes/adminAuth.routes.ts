import { Router } from "express";
import { signInController, signUpController } from "../controllers/adminAuth.controller";


const adminAuthRoutes = Router();

adminAuthRoutes.post('/signin', signInController)
adminAuthRoutes.post('/signup', signUpController)

export default adminAuthRoutes
