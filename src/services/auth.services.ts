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
  const { clerkId, firstname, role, phone } = dto;

  // Vérification des champs
  if (!clerkId || !firstname || !phone) {
    throw new Error("Les champs clerkId, prénom et téléphone sont requis.");
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
        phone: existingUser.phone,
      },
    };
  }

  // Création de l’utilisateur dans ta BDD
  const user = await prisma.user.create({
    data: {
      clerkId,
      firstname,
      role: role ?? "PROSPECT", // par défaut si rien n’est fourni
      phone,
    },
  });

  return {
    user: {
      id: user.id,
      clerkId: user.clerkId,
      firstname: user.firstname,
      role: user.role,
      phone: user.phone,
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

// Mettre à jour le rôle de l'utilisateur
export async function updateUserRole(clerkId: string, newRole: string) {
  if (!clerkId) {
    throw new Error("clerkId requis.");
  }

  const validRoles = ["AGENT", "PROSPECT"];
  if (!validRoles.includes(newRole)) {
    throw new Error("Le rôle doit être  AGENT ou PROSPECT");
  }

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  // Mettre à jour le rôle dans la base de données
  const updatedUser = await prisma.user.update({
    where: { clerkId },
    data: { role: newRole as any },
  });

  // Mettre à jour les métadonnées Clerk si la clé secrète est disponible
  if (process.env.CLERK_SECRET_KEY) {
    try {
      const response = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unsafe_metadata: {
            role: newRole,
          },
        }),
      });

      if (!response.ok) {
        console.error('Erreur lors de la mise à jour de Clerk:', response.statusText);
        // Continuer même si la mise à jour Clerk échoue
      }
    } catch (error) {
      console.error('Erreur lors de la communication avec Clerk API:', error);
      // Continuer même si la mise à jour Clerk échoue
    }
  }

  return {
    user: {
      id: updatedUser.id,
      clerkId: updatedUser.clerkId,
      firstname: updatedUser.firstname,
      role: updatedUser.role,
    },
  };
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

