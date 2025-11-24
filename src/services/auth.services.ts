import { SignInDto, SignUpDto } from "../dto/auth.dto";
import { prisma } from "../utils/db";
import * as bcrypt from "bcrypt"
import Jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";

const SALT_ROUNDS = 10;
// const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // à sécuriser en prod

// Fonction d'inscription
// export async function signUp(dto: SignUpDto) {
//     const { firstname, email, password, role } = dto
//      // Vérification des champs requis
//     if (!email || !password || !firstname) {
//         throw new Error("Les champs email, mot de passe et prénom sont requis.")
//     }
//      //Vérification de l'unicité de l'email
//   const existingUser = await prisma.user.findUnique({ where: { email } });
//   if (existingUser) {
//     throw new Error("Cet email est déjà utilisé.");
//   }

//     // Hashage du mot de passe
//     const hashPassword = await bcrypt.hash(password, SALT_ROUNDS)
    
//  // Création de l'utilisateur
//     const user = await prisma.user.create({
//         data: {
//             firstname,
//             email,
//             password: hashPassword,
//             role: role ?? "PROSPECT", // rôle par défaut si non fourni

//         }
//     })
//      // retour de données
//     return { user: { id: user.id, email: user.email, firstname: user.firstname, role: user.role } }

// }

//Fonction de connexion

export async function signUp(dto: SignUpDto) {
  const { clerkId, firstname, role } = dto;

  // Vérification des champs
  if (!clerkId || !firstname) {
    throw new Error("Les champs clerkId, email et prénom sont requis.");
  }

  // Vérification si l’utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existingUser) {
    return {
      user: {
        id: existingUser.id,
        clerkId: existingUser.clerkId,
        firstname: existingUser.firstname,
        role: existingUser.role,
      },
    };
  }

  // Création de l’utilisateur dans ta BDD
  const user = await prisma.user.create({
    data: {
      clerkId,
      firstname,
      role: role ?? "PROSPECT", // par défaut si rien n’est fourni
    },
  });

  return {
    user: {
      id: user.id,
      clerkId: user.clerkId,
      firstname: user.firstname,
      role: user.role,
    },
  };
}

export async function signIn(dto: SignInDto) {
  const { clerkId } = dto;

  if (!clerkId) {
    throw new Error("clerkId requis.");
  }

  // On cherche l'utilisateur via clerkId
  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    throw new Error("Utilisateur non trouvé. Synchronisez d’abord avec Clerk.");
  }

  // Génération de ton propre JWT interne (si nécessaire)
  const token = Jwt.sign(
    { userId: user.id, clerkId: user.clerkId, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: user.id,
      clerkId: user.clerkId,
      firstname: user.firstname,
      role: user.role,
    },
  };
}

// Helper: return database user id from a Clerk clerkId (or null if not found)
export async function getDbUserIdByClerkId(clerkId: string): Promise<number | null> {
  if (!clerkId) return null;
  const user = await prisma.user.findUnique({ where: { clerkId } });
  return user ? user.id : null;
}

// export async function signIn(dto: SignInDto) {
//     const { email, password } = dto;
//      //Vérification des champs requis
//     if (!email || !password) {
//         throw new Error("Les champs email et mot de passe sont requis.");
//     }

//     // On cherche l'utilisateur dans la DB
//     const user = await prisma.user.findUnique({ where: { email } });

//     // Vérification si utilisateur existe et si le mot de passe est correct
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//         throw new Error("invalid email or password");
//     }

//     // Génération du token JWT
//     const token = Jwt.sign(
//         { userId: user.id, email: user.email, role:user.role },
//         JWT_SECRET,
//         { expiresIn: '1h' }
//     );
//      // retour de données
//     return { token, user: { id: user.id, email: user.email, firstname: user.firstname, role: user.role } };
// }


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

