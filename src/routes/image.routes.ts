import { Router } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "@clerk/express";
import { createImage } from "../controllers/image.controller"
import { sendError } from "../utils/apiResponse";

const router = Router();

// Types de fichiers acceptés : uniquement des images courantes.
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// config multer (local dev)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo max par fichier — évite qu'on remplisse le disque du serveur
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Type de fichier non autorisé. Seules les images sont acceptées."));
    }
    cb(null, true);
  },
});

// requireAuth() : seul un utilisateur connecté peut uploader un fichier sur le serveur.

/**
 * @openapi
 * /images:
 *   post:
 *     summary: Uploader une image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploadée, URL renvoyée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       400:
 *         description: Aucun fichier, type non autorisé ou fichier trop volumineux (> 5 Mo)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/", requireAuth(), upload.single("file"), createImage);

// Convertit les erreurs de multer (fichier trop gros, type refusé) en réponse JSON
// propre, au lieu de laisser Express renvoyer une page d'erreur HTML brute que
// le frontend ne saurait pas parser.
router.use((err: any, req: any, res: any, next: any) => {
  if (err) {
   return sendError(res, 400, err.message || "Erreur lors de l'upload");  }
  next();
});

export default router;