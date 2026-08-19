// Charge les variables du fichier .env dans process.env AVANT tout le reste.
// Doit être en tout premier import, sinon les variables ne seraient pas
// encore disponibles quand le reste du fichier s'exécute.
import 'dotenv/config';

import express from 'express';
import { createServer } from 'http';

// Chaque fichier "*.routes" regroupe les routes d'une fonctionnalité
// (auth, annonces, favoris, rendez-vous, messages, images, admin...).
// Ça permet de garder server.ts court : il ne fait qu'assembler les morceaux.
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
import { setupSocketIO } from './services/socket.service';
import adminRoutes from './routes/adminRoutes.routes';

// L'application Express : c'est elle qui reçoit les requêtes HTTP
// (GET, POST, etc.) et les distribue vers les bonnes routes.
const app = express();

// Express seul ne sait faire que du HTTP classique (requête -> réponse).
// Pour le temps réel (Socket.io = chat en direct, notifications...), il faut
// un serveur HTTP "brut" sur lequel on peut brancher à la fois Express ET
// Socket.io. C'est pour ça qu'on ne fait pas juste `app.listen(...)`.
const httpServer = createServer(app);
const io = setupSocketIO(httpServer);

// On stocke l'instance Socket.io dans l'app Express pour pouvoir
// y accéder depuis n'importe quel contrôleur/route via `req.app.get('io')`
// (utile par ex. pour notifier un utilisateur en temps réel après une action).
app.set('io', io);

// ---- Ancienne config CORS, gardée en commentaire pour référence ----
// On pourra la supprimer une fois qu'on aura vérifié que la nouvelle marche.
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5174'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }))

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
const allowedOrigins = process.env.CORS_ORIGIN
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

// Chaque ligne "branche" un groupe de routes sur un préfixe d'URL.
// Ex: userRoutes gère tout ce qui commence par /auth
//     (donc /auth/login, /auth/signup, etc. définis dans auth.routes.ts)
app.use('/auth', userRoutes)
app.use('/annonces', annonceRoutes)
app.use('/favoris', favorisRoutes) 
app.use('/rdvs', rdvRoutes)
app.use("/messages", messageRoutes)

// Sert les fichiers uploadés (images d'annonces, etc.) comme fichiers
// statiques : un fichier sauvegardé dans uploads/photo.jpg devient
// accessible via http://.../uploads/photo.jpg
app.use("/uploads", express.static("uploads"));

app.use("/images", imageRoutes)
app.use('/auth/sync', authSyncRoutes)
app.use('/admin', adminRoutes)

// Le port d'écoute du serveur. En local, si rien n'est précisé dans .env,
// on utilise 5000 par défaut. En Docker/production, ce sera défini par la
// variable d'environnement PORT (utile si l'hébergeur impose son propre port).
// httpServer.listen(5000, () => console.log('Serveur démarre sur le port 5000 avec Socket.io'));
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Serveur démarre sur le port ${PORT} avec Socket.io`));

// Exporté au cas où d'autres fichiers (ex: tests) auraient besoin
// d'importer l'app Express directement.
export default app