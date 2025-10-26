import express from 'express';
import  userRoutes  from './routes/auth.routes';
import cors from 'cors'
import annonceRoutes from './routes/annonce.routes'; 
import favorisRoutes from './routes/favoris.routes';
import rdvRoutes from "./routes/rdv.routes";
import messageRoutes from './routes/message.routes';
import authSyncRoutes from './routes/authSync.routes';
import imageRoutes from './routes/image.routes';
import bodyParser from "body-parser";
import clerkWebhook from './routes/clerkwebhook.routes';

const app = express();

app.use(cors({
  origin: '*', // autorise le frontend
  credentials: true // si on veut envoyer des cookies plus tard
}))

// Webhook route must come before body parsers
app.use('/webhooks', clerkWebhook)

app.use(bodyParser.json());
app.use(express.json())
app.get('/', (req, res) => res.send('API LAMAISON fonctionne'));
app.use('/auth', userRoutes)
app.use('/annonces', annonceRoutes)
app.use('/favoris', favorisRoutes) 
app.use('/rdvs', rdvRoutes)
app.use("/messages", messageRoutes)
app.use("/uploads", express.static("uploads")); // servir les fichiers locaux
app.use("/images", imageRoutes)
app.use('/auth/sync', authSyncRoutes)
app.listen(5000, () => console.log('Serveur démarre sur le port 5000'));
export default app 