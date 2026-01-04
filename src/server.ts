import express from 'express';
import { createServer } from 'http';
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

const app = express();
const httpServer = createServer(app);
const io = setupSocketIO(httpServer);

// Make io available to routes
app.set('io', io);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Webhook route must come before body parsers
app.use('/webhooks', clerkWebhook)

app.use(clerkMiddleware());

app.use(bodyParser.json());
app.use(express.json())
app.get('/', (req, res) => res.send('API LAMAISON fonctionne'));
app.use('/auth', userRoutes)
app.use('/annonces', annonceRoutes)
app.use('/favoris', favorisRoutes) 
app.use('/rdvs', rdvRoutes)
app.use("/messages", messageRoutes)
app.use("/uploads", express.static("uploads"));
app.use("/images", imageRoutes)
app.use('/auth/sync', authSyncRoutes)
app.use('/admin', adminRoutes)



httpServer.listen(5000, () => console.log('Serveur démarre sur le port 5000 avec Socket.io'));
export default app 