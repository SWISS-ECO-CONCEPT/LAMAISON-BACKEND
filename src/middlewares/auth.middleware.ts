import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";


// const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // à sécuriser en prod

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Non authentifié" });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET); // on utilise la constante définie
    req.user = decoded; // contient l'id et le role
    next();
  } catch {
    return res.status(403).json({ error: "Token invalide" });
  }
};
