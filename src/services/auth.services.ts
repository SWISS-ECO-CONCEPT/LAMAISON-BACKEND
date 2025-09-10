import { SignInDto, SignUpDto } from "../dto/auth.dto";
import prisma from "../utils/db";
import * as bcrypt from "bcrypt"
import Jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";

const SALT_ROUNDS = 10;
// const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // à sécuriser en prod

// Fonction d'inscription
export async function signUp(dto: SignUpDto) {
    const { firstname, email, password, role } = dto
     // Vérification des champs requis
    if (!email || !password || !firstname) {
        throw new Error("Les champs email, mot de passe et prénom sont requis.")
    }
     //Vérification de l'unicité de l'email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Cet email est déjà utilisé.");
  }

    // Hashage du mot de passe
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS)
    
 // Création de l'utilisateur
    const user = await prisma.user.create({
        data: {
            firstname,
            email,
            password: hashPassword,
            role: role ?? "PROSPECT", // rôle par défaut si non fourni

        }
    })
     // retour de données
    return { user: { id: user.id, email: user.email, firstname: user.firstname, role: user.role } }

}
//Fonction de connexion
export async function signIn(dto: SignInDto) {
    const { email, password } = dto;
     //Vérification des champs requis
    if (!email || !password) {
        throw new Error("Les champs email et mot de passe sont requis.");
    }

    // On cherche l'utilisateur dans la DB
    const user = await prisma.user.findUnique({ where: { email } });

    // Vérification si utilisateur existe et si le mot de passe est correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("invalid email or password");
    }

    // Génération du token JWT
    const token = Jwt.sign(
        { userId: user.id, email: user.email, role:user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
     // retour de données
    return { token, user: { id: user.id, email: user.email, firstname: user.firstname, role: user.role } };
}


// export async function signIn(dto: SignInDto) {
//     const { email, password } = dto
//     if (!email || !password) {
//         throw new Error("fields are required")
//     }
//     const hashPassword = await bcrypt.hash(password, 10)
//     const user = await prisma.user.findUnique({ where: { email } })
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//         throw new Error("invalid email or password")
//     }
//     const token = Jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1h' })

//     return { token, user: { id: user.id, email: user.email } }
// }

