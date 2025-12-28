import {prisma} from "../utils/db";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SignUpDto, SignInDto } from "../dto/adminAuth.dto";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Inscription
export async function signUp(dto: SignUpDto) {
  const { name, email, password, role } = dto;

  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (existingAdmin) throw new Error("Email déjà utilisé");

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newAdmin = await prisma.admin.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  return { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role };
}

// Connexion
export async function signIn(dto: SignInDto) {
  const { email, password } = dto;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new Error("Utilisateur non trouvé");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Mot de passe incorrect");

  const token = jwt.sign({ adminId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "1h" });
  return { token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } };
}

