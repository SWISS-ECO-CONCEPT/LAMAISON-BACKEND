// ============================================================================
// Pourquoi ce fichier existe séparément de server.ts :
// app.ts construit l'application Express (routes, middlewares) SANS jamais
// ouvrir de port réseau. server.ts prend cette app et la fait vraiment tourner
// (serveur HTTP + Socket.io + .listen()).
//
// Intérêt concret : les tests (Supertest) peuvent importer cette app directement
// et lui envoyer de fausses requêtes en mémoire, sans avoir besoin d'un vrai
// port ouvert — donc pas de conflit avec le serveur de dev déjà lancé sur 5000,
// et des tests qui s'exécutent bien plus vite. C'est aussi ce qui permettrait,
// si un jour une partie de l'API tournait en serverless (AWS Lambda, etc.),
// de réutiliser cette même app sans son .listen().
// ============================================================================

// Charge les variables du fichier .env dans process.env AVANT tout le reste.
// Doit être en tout premier import, sinon les variables ne seraient pas
// encore disponibles quand le reste du fichier s'exécute.
import 'dotenv/config';

import express from 'express';

// Chaque fichier "*.routes" regroupe les routes d'une fonctionnalité
// (auth, annonces, favoris, rendez-vous, messages, images, admin...).
// Ça permet de garder ce fichier court : il ne fait qu'assembler les morceaux.
import userRoutes from './routes/auth.routes';
import cors from 'cors'
import annonceRoutes from './routes/annonce.routes'; 
import favorisRoutes from './routes/favoris.routes';
import rdvRoutes from "./routes/rdv.routes";
import messageRoutes from './routes/message.routes';
import authSyncRoutes from './routes/authSync.routes';
import imageRoutes from './routes/image.routes';
import bodyParser from "body-parser";
import clerkWebhook from './routes/clerkwebhook.routes';
import { clerkMiddleware } from "@clerk/express";
import adminRoutes from './routes/adminRoutes.routes';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

// L'application Express : c'est elle qui reçoit les requêtes HTTP
// (GET, POST, etc.) et les distribue vers les bonnes routes.
const app = express();

// CORS = règle de sécurité du navigateur qui bloque par défaut les requêtes
// entre deux origines différentes (ex: frontend sur le port 5173 qui appelle
// une API sur le port 5000). Il faut donc dire explicitement à l'API quelles
// origines ont le droit de l'appeler.
//
// process.env.CORS_ORIGIN va contenir, en production/Docker, la vraie URL
// du frontend (ex: "https://lamaison.com"). Si plusieurs origines sont
// autorisées, on les sépare par une virgule dans la variable d'env
// (ex: "https://lamaison.com,https://admin.lamaison.com") puis on les
// transforme en tableau avec .split(',').
//
// Si la variable n'est pas définie (en dev local, par exemple), on retombe
// sur les valeurs par défaut d'avant : localhost:5173 et 5174.
//
// Exporté en plus de "app" : server.ts en a aussi besoin, pour configurer
// le CORS de Socket.io avec exactement la même liste d'origines autorisées.
export const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

  
app.use(cors({
  origin: allowedOrigins,       // qui a le droit d'appeler cette API
  credentials: true,            // autorise l'envoi de cookies / headers d'auth
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Le webhook Clerk (notifications envoyées par Clerk quand un compte est
// créé/modifié) doit être déclaré AVANT les parseurs de body classiques,
// car Clerk vérifie une signature sur le corps brut de la requête —
// si express.json() l'avait déjà transformé, la vérification échouerait.
app.use('/webhooks', clerkWebhook)

// Middleware Clerk : lit le token d'authentification envoyé par le
// frontend et attache les infos utilisateur à la requête (req.auth).
app.use(clerkMiddleware());

// Ces deux lignes font quasiment la même chose (parser le JSON envoyé
// dans le corps des requêtes). body-parser est l'ancien package,
// express.json() est la version moderne intégrée à Express — les deux
// sont présents ici, mais un seul suffirait en théorie.
app.use(bodyParser.json());
app.use(express.json())

// Route de test simple pour vérifier que l'API répond.
app.get('/', (req, res) => res.send('API LAMAISON fonctionne'));

// Documentation interactive de l'API, accessible sur http://localhost:5000/api-docs
// Volontairement HORS /api/v1 : c'est un outil de dev/référence, pas un endpoint
// consommé par le frontend ou le mobile.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Toutes les routes API sont regroupées sous /api/v1 au lieu d'être montées
// directement à la racine. Objectif : pouvoir introduire un jour /api/v2 sans
// casser les clients (web, admin, mobile) qui tournent encore sur v1 — chaque
// version cohabite indépendamment le temps de la migration.
const apiV1 = express.Router();

// Chaque ligne "branche" un groupe de routes sur un préfixe d'URL.
// Ex: userRoutes gère tout ce qui commence par /auth
//     (donc /auth/login, /auth/signup, etc. définis dans auth.routes.ts)
apiV1.use('/auth', userRoutes)
apiV1.use('/annonces', annonceRoutes)
apiV1.use('/favoris', favorisRoutes) 
apiV1.use('/rdvs', rdvRoutes)
apiV1.use("/messages", messageRoutes)
apiV1.use("/images", imageRoutes)
apiV1.use('/auth/sync', authSyncRoutes)
apiV1.use('/admin', adminRoutes)

app.use('/api/v1', apiV1)

// Sert les fichiers uploadés (images d'annonces, etc.) comme fichiers
// statiques : un fichier sauvegardé dans uploads/photo.jpg devient
// accessible via http://.../uploads/photo.jpg
// Reste HORS /api/v1 : ce n'est pas un endpoint API, c'est un chemin de
// fichier statique déjà stocké tel quel dans les URLs enregistrées en base
// (annonce.images) — le préfixer casserait toutes les images existantes.
app.use("/uploads", express.static("uploads"));

// Exporté au cas où d'autres fichiers (ex: tests) auraient besoin
// d'importer l'app Express directement.
export default app