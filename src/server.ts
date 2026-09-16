// ============================================================================
// Pourquoi ce fichier existe séparément de app.ts :
// C'est le seul point d'entrée qui démarre vraiment le serveur — celui que
// lancent `npm run dev`, le Dockerfile et docker-compose.yml. Il prend l'app
// Express déjà entièrement configurée dans app.ts et l'attache à un vrai
// serveur HTTP + Socket.io, puis ouvre le port d'écoute.
//
// Les tests n'importent JAMAIS ce fichier (seulement app.ts) : importer
// server.ts déclencherait un vrai .listen() sur le port 5000, qui est déjà
// occupé par le serveur de dev en train de tourner à côté.
// ============================================================================
import { createServer } from 'http';
import app, { allowedOrigins } from './app';
import { setupSocketIO } from './services/socket.service';

// Express seul ne sait faire que du HTTP classique (requête -> réponse).
// Pour le temps réel (Socket.io = chat en direct, notifications...), il faut
// un serveur HTTP "brut" sur lequel on peut brancher à la fois Express ET
// Socket.io. C'est pour ça qu'on ne fait pas juste `app.listen(...)`.
const httpServer = createServer(app);

// On réutilise la même liste d'origines autorisées que pour Express (CORS_ORIGIN),
// au lieu de laisser Socket.io avec sa propre liste figée sur les ports de dev Vite —
// c'est ce décalage qui empêchait les notifications temps réel de fonctionner.
const io = setupSocketIO(httpServer, allowedOrigins);

// On stocke l'instance Socket.io dans l'app Express pour pouvoir
// y accéder depuis n'importe quel contrôleur/route via `req.app.get('io')`
// (utile par ex. pour notifier un utilisateur en temps réel après une action).
app.set('io', io);

// Le port d'écoute du serveur. En local, si rien n'est précisé dans .env,
// on utilise 5000 par défaut. En Docker/production, ce sera défini par la
// variable d'environnement PORT (utile si l'hébergeur impose son propre port).
// httpServer.listen(5000, () => console.log('Serveur démarre sur le port 5000 avec Socket.io'));
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Serveur démarre sur le port ${PORT} avec Socket.io`));