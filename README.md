# LAMAISON Backend - API REST

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express-5.1+-000000)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0+-2F7DDC)](https://www.prisma.io/)

Le backend de LAMAISON est une API REST moderne construite avec Node.js, Express.js et TypeScript, conçue pour alimenter l'application immobilière avec des performances optimales et une scalabilité horizontale.

## Architecture & Design Patterns

### Architecture en Couches
```
┌─────────────────────────────────────────────────────────────┐
│                 API Layer (Express)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐ │
│  │ Controllers │ │ Middleware  │ │    Routes     │ │
│  └─────────────┘ └─────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Business Logic Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐ │
│  │  Services   │ │   DTOs      │ │  Validation  │ │
│  └─────────────┘ └─────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Data Access Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐ │
│  │  Prisma     │ │   Models    │ │   Database    │ │
│  │    ORM      │ │             │ │   (MySQL)    │ │
│  └─────────────┘ └─────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Implémentés
- **Repository Pattern** : Abstraction de l'accès aux données
- **DTO Pattern** : Validation et transformation des données
- **Service Layer** : Séparation de la logique métier
- **Middleware Pattern** : Gestion des requêtes HTTP
- **Observer Pattern** : Notifications temps réel
- **Factory Pattern** : Création des services

## Stack Technique

### Core Technologies
- **Node.js 18+** : Runtime JavaScript haute performance
- **Express.js 5.1** : Framework web minimaliste
- **TypeScript 5.8** : Typage strict et développement sécurisé
- **ESM Modules** : Système de modules modernes

### Database & ORM
- **MySQL/MariaDB** : Base de données relationnelle robuste
- **Prisma 7.0** : ORM next-generation avec type safety
- **Connection Pooling** : Optimisation des connexions
- **Migrations** : Version control du schéma

### Authentication & Security
- **Clerk** : Authentification as-a-service
  - SSO & Social Login
  - Multi-factor authentication
  - Session management
  - Webhooks pour la synchronisation
- **JWT Tokens** : Tokens d'accès signés
- **bcrypt** : Hashage sécurisé des mots de passe
- **Helmet.js** : Sécurisation des headers HTTP

### Real-time Communication
- **Socket.io 4.7** : Communication bidirectionnelle
  - Rooms & Namespaces
  - Auto-reconnection
  - CORS configuration
  - Error handling avancé

### File Management
- **Multer 2.0** : Upload de fichiers middleware
- **Sharp** : Traitement et optimisation d'images
- **File Storage** : Organisation hiérarchique des uploads

### Development Tools
- **tsx 4.20** : Exécution TypeScript en développement
- **nodemon** : Auto-restart sur modifications
- **ESLint** : Linting du code
- **Prettier** : Formatting automatique

## Structure du Projet

```
backend/
├── src/
│   ├── controllers/          # Logique des requêtes HTTP
│   │   ├── annonce.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── message.controller.ts
│   │   ├── rdv.controller.ts
│   │   └── favoris.controller.ts
│   ├── services/           # Logique métier
│   │   ├── annonce.service.ts
│   │   ├── auth.service.ts
│   │   ├── socket.service.ts
│   │   └── email.service.ts
│   ├── routes/             # Définition des routes API
│   │   ├── annonce.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── message.routes.ts
│   │   └── rdv.routes.ts
│   ├── dto/               # Data Transfer Objects
│   │   ├── annonce.dto.ts
│   │   ├── auth.dto.ts
│   │   ├── message.dto.ts
│   │   └── rdv.dto.ts
│   ├── middleware/         # Middleware personnalisés
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/             # Utilitaires partagés
│   │   ├── db.ts
│   │   ├── logger.ts
│   │   └── helpers.ts
│   └── server.ts          # Point d'entrée de l'application
├── prisma/
│   ├── schema.prisma       # Schéma de la base de données
│   ├── migrations/         # Historique des migrations
│   └── seed.ts           # Données de test
├── generated/             # Client Prisma généré
├── uploads/              # Fichiers uploadés
├── logs/                # Logs de l'application
├── package.json
├── tsconfig.json
└── .env.example          # Variables d'environnement
```

##  Installation & Configuration

### Prérequis
- **Node.js** : v18.17.0 ou supérieur
- **npm** : v9.0.0 ou supérieur
- **MySQL** : v8.0+ ou **MariaDB** : v10.6+
- **Compte Clerk** : Pour l'authentification

### Installation
```bash
# Cloner le repository
git clone https://github.com/SWISS-ECO-CONCEPT/LAMAISON-BACKEND.git
cd LAMAISON-BACKEND

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

### Configuration de l'Environnement
```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/lamaison?schema=public"
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=lamaison_user
DB_PASSWORD=votre_mot_de_passe_secure
DB_NAME=lamaison

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLERK_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLERK_API_KEY="sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Application Configuration
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp,gif

# Email Configuration (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_app_password

# Redis Configuration (optionnel)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=votre_redis_password

# Security Configuration
JWT_SECRET=votre_jwt_secret_tres_long_et_complexe
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=./logs/app.log
```

### Base de Données
```bash
# Créer la base de données
mysql -u root -p
CREATE DATABASE lamaison CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lamaison_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_secure';
GRANT ALL PRIVILEGES ON lamaison.* TO 'lamaison_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Remplir avec des données de test
npx prisma db seed
```

## Commandes Disponibles

### Développement
```bash
# Démarrer le serveur en développement avec hot-reload
npm run dev
# Équivalent: tsx --watch src/server.ts

# Démarrer avec debugging
npm run dev:debug
# Équivalent: tsx --inspect src/server.ts

# Démarrer en mode production
npm start
# Équivalent: node dist/server.js

# Builder pour la production
npm run build
# Équivalent: tsc && npm run build:assets
```

### Tests & Qualité
```bash
# Lancer tous les tests
npm test
# Équivalent: jest --coverage

# Tests en mode watch
npm run test:watch

# Tests de couverture
npm run test:coverage

# Linting du code
npm run lint
# Équivalent: eslint src/**/*.ts

# Linting avec auto-fix
npm run lint:fix

# Vérification des types TypeScript
npm run type-check
# Équivalent: tsc --noEmit
```

### Base de Données
```bash
# Générer le client Prisma après modification du schéma
npx prisma generate
# Output: Client généré dans ./generated/prisma

# Créer une nouvelle migration
npx prisma migrate dev --name nom_descriptif
# Exemple: npx prisma migrate dev --name add_user_avatar

# Appliquer les migrations en production
npx prisma migrate deploy
# Utilisé dans les pipelines CI/CD

# Pousser les changements du schéma vers la BDD
npx prisma db push
# Pour le développement rapide

# Réinitialiser complètement la base de données
npx prisma migrate reset
#  Attention: cela supprime toutes les données

# Ouvrir l'interface Prisma Studio
npx prisma studio
# Ouvre http://localhost:5555

# Valider le schéma Prisma
npx prisma validate
# Vérifie la syntaxe du schéma

# Formater le schéma Prisma
npx prisma format
# Formate automatiquement schema.prisma
```

### Gestion des Seeds
```bash
# Exécuter le seed de données
npx prisma db seed

# Réinitialiser et seeder
npx prisma migrate reset --force
npx prisma db seed
```

## API Endpoints

### Authentification
```http
POST   /auth/sync              # Synchronisation utilisateur Clerk
GET    /auth/profile           # Profil utilisateur
PUT    /auth/profile           # Mise à jour profil
DELETE /auth/profile           # Suppression compte
```

### Annonces
```http
GET    /annonces              # Liste des annonces (avec filtres)
GET    /annonces/:id          # Détail d'une annonce
POST   /annonces              # Créer une annonce
PUT    /annonces/:id          # Mettre à jour une annonce
DELETE /annonces/:id          # Supprimer une annonce
POST   /annonces/:id/views    # Incrémenter les vues
GET    /annonces/search       # Recherche avancée
```

### Rendez-vous
```http
GET    /rdvs                  # Rendez-vous (filtres par utilisateur)
POST   /rdvs                  # Créer une demande de RDV
GET    /rdvs/:id              # Détail d'un RDV
PUT    /rdvs/:id/status       # Mettre à jour le statut
DELETE /rdvs/:id              # Annuler un RDV
GET    /rdvs/annonce/:id       # RDV pour une annonce
```

### Messages
```http
GET    /messages               # Conversations utilisateur
POST   /messages              # Envoyer un message
GET    /messages/:userId       # Conversation avec un utilisateur
PUT    /messages/:id/read     # Marquer comme lu
DELETE /messages/:id          # Supprimer un message
```

### Favoris
```http
GET    /favoris               # Liste des favoris
POST   /favoris               # Ajouter aux favoris
DELETE /favoris/:annonceId    # Retirer des favoris
GET    /favoris/check/:annonceId # Vérifier si en favoris
```

### Images
```http
POST   /images/upload         # Upload multiple d'images
GET    /images/:filename      # Servir les images
DELETE /images/:filename      # Supprimer une image
POST   /images/optimize       # Optimiser une image
```

### Administration
```http
GET    /admin/users            # Liste des utilisateurs
GET    /admin/stats           # Statistiques générales
POST   /admin/annonces/approve # Approuver une annonce
DELETE /admin/annonces/:id    # Supprimer une annonce (admin)
```

## Socket.io Events

### Connection Events
```typescript
// Client → Server
socket.emit('authenticate', token)
socket.emit('join_room', roomId)
socket.emit('leave_room', roomId)

// Server → Client
socket.emit('authenticated', user)
socket.emit('room_joined', roomId)
socket.emit('room_left', roomId)
```

### Message Events
```typescript
// Client → Server
socket.emit('send_message', { receiverId, content })
socket.emit('typing_start', { receiverId })
socket.emit('typing_stop', { receiverId })

// Server → Client
socket.emit('new_message', message)
socket.emit('message_read', { messageId, userId })
socket.emit('user_typing', { userId, isTyping })
```

### Rendez-vous Events
```typescript
// Server → Client
socket.emit('rdv_created', rdv)
socket.emit('rdv_updated', rdv)
socket.emit('rdv_cancelled', rdvId)
```

## Architecture des Services

### AnnonceService
```typescript
export class AnnonceService {
  async createAnnonce(data: CreateAnnonceDto): Promise<Annonce>
  async getAnnonceById(id: number): Promise<Annonce | null>
  async getAnnonces(filters: AnnonceFilters): Promise<Annonce[]>
  async updateAnnonce(id: number, data: UpdateAnnonceDto): Promise<Annonce>
  async deleteAnnonce(id: number): Promise<Annonce>
  async incrementViews(id: number): Promise<Annonce>
  async searchAnnonces(query: SearchQuery): Promise<Annonce[]>
}
```

### AuthService
```typescript
export class AuthService {
  async syncUser(clerkId: string): Promise<User>
  async getUserProfile(userId: number): Promise<User | null>
  async updateProfile(userId: number, data: UpdateUserDto): Promise<User>
  async deleteAccount(userId: number): Promise<void>
  async verifyToken(token: string): Promise<User | null>
}
```

### MessageService
```typescript
export class MessageService {
  async sendMessage(data: CreateMessageDto): Promise<Message>
  async getConversations(userId: number): Promise<Conversation[]>
  async getMessages(userId1: number, userId2: number): Promise<Message[]>
  async markAsRead(messageId: number, userId: number): Promise<void>
  async deleteMessage(messageId: number, userId: number): Promise<void>
}
```

## Sécurité

### Authentication Middleware
```typescript
export const requireAuth = (handler: Function) => {
  return async (req: Request, res: Response) => {
    const { userId } = req.auth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return handler(req, res);
  };
};
```

### Role-based Access Control
```typescript
export const requireRole = (roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getCurrentUser(req.auth.userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes
  message: 'Too many requests from this IP'
});
```

## Monitoring & Logging

### Structured Logging
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

## Tests

### Structure des Tests
```
tests/
├── unit/
│   ├── services/
│   │   ├── annonce.service.test.ts
│   │   └── auth.service.test.ts
│   └── controllers/
│       ├── annonce.controller.test.ts
│       └── auth.controller.test.ts
├── integration/
│   ├── api/
│   │   ├── annonces.test.ts
│   │   └── auth.test.ts
│   └── database/
│       └── migrations.test.ts
└── e2e/
    └── user-journey.test.ts
```

### Exemple de Test
```typescript
describe('AnnonceService', () => {
  it('should create a new annonce', async () => {
    const annonceData = {
      titre: 'Beautiful House',
      description: 'A lovely house...',
      prix: 250000,
      ville: 'Paris'
    };
    
    const annonce = await annonceService.createAnnonce(annonceData);
    
    expect(annonce).toBeDefined();
    expect(annonce.titre).toBe(annonceData.titre);
    expect(annonce.prix).toBe(annonceData.prix);
  });
});
```

## Déploiement

### Avec Docker (recommandé)

Le backend est conteneurisé via un `Dockerfile` multi-étape (Node.js 20 slim) :

```bash
cd deploy
cp .env.example .env   # Configurer les variables
docker compose up --build
```

Le conteneur backend :
1. Installe les dépendances et génère le client Prisma
2. Au démarrage, applique les migrations (`prisma migrate deploy`)
3. Lance le serveur TypeScript via `tsx`

Le `DATABASE_URL` est automatiquement construit par docker-compose pour pointer vers le service `db` (MariaDB) du réseau interne Docker.

Les fichiers uploadés sont persistés dans un volume Docker `uploads_data`.

### Sans Docker

```bash
npm run build
npx prisma migrate deploy
npm start
```

### Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `DATABASE_URL` | oui | URL de connexion MySQL/MariaDB |
| `CLERK_SECRET_KEY` | oui | Clé secrète Clerk |
| `CLERK_PUBLISHABLE_KEY` | oui | Clé publique Clerk |
| `CLERK_WEBHOOK_SIGNING_SECRET` | oui | Secret de vérification des webhooks Clerk |
| `CORS_ORIGIN` | oui | Origines autorisées (séparées par `,`) |
| `PORT` | non | Port du serveur (défaut : `5000`) |
| `JWT_SECRET` | non | Secret JWT pour l'admin (défaut : `dev-secret`) |

#### Erreur Clerk
```bash
# Vérifier les clés API
echo $CLERK_SECRET_KEY
echo $CLERK_PUBLISHABLE_KEY

# Tester le webhook
curl -X POST http://localhost:5000/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"type": "user.created"}'
```

#### Problèmes de fichiers uploadés
```bash
# Vérifier les permissions du dossier uploads
ls -la uploads/

# Créer le dossier si nécessaire
mkdir -p uploads
chmod 755 uploads
```

### Logs
```bash
# Voir les logs en temps réel
tail -f logs/combined.log

# Voir uniquement les erreurs
tail -f logs/error.log

# Filtrer les logs par niveau
grep "ERROR" logs/combined.log
```


## 👥 Contributeurs

- Gilles - Développeur principal

---

---

CI-DESSOUS EST UNE PRESENTATION GLOBALE DE L'APPLICATION (BACKEND+FRONTEND)
# LAMAISON - Application Immobilière

LAMAISON est une application web immobilière complète permettant la gestion d'annonces immobilières, la prise de rendez-vous, la messagerie entre utilisateurs et la gestion des favoris. L'application est structurée avec un backend Node.js/Express et un frontend React/TypeScript.

## Architecture du Projet

```
LAMAISON/
├── backend/                 # API REST avec Express.js
│   ├── src/
│   │   ├── controllers/     # Logique métier
│   │   ├── routes/         # Routes API
│   │   ├── services/       # Services (Socket.io, etc.)
│   │   ├── dto/            # Data Transfer Objects
│   │   └── server.ts       # Point d'entrée du serveur
│   ├── prisma/             # Schéma de base de données
│   └── generated/          # Client Prisma généré
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── layouts/        # Layouts principaux
│   │   └── context/        # Contextes React
└── admin-interface/        # Interface d'administration
```

## Fonctionnalités Principales

### Pour les Agents Immobiliers
- **Gestion des annonces** : Création, modification, suppression d'annonces immobilières
- **Gestion des rendez-vous** : Validation et planification des visites
- **Messagerie** : Communication avec les prospects
- **Tableau de bord** : Vue d'ensemble des activités

### Pour les Prospects/Acheteurs
- **Recherche d'annonces** : Filtrage par ville, type de bien, prix, etc.
- **Favoris** : Sauvegarde des annonces intéressantes
- **Prise de rendez-vous** : Demande de visites
- **Messagerie** : Communication avec les agents

### Fonctionnalités Transverses
- **Authentification** : Via Clerk avec rôles (ADMIN, AGENT, PROSPECT)
- **Internationalisation** : Support français/anglais
- **Upload d'images** : Gestion des photos des biens
- **Notifications temps réel** : Via Socket.io

## Stack Technique

### Backend
- **Node.js** + **Express.js** : Serveur API REST
- **TypeScript** : Typage strict
- **Prisma** : ORM pour la base de données MySQL
- **Clerk** : Authentification et gestion des utilisateurs
- **Socket.io** : Communication temps réel
- **Multer** : Upload de fichiers
- **JWT** : Tokens d'authentification

### Frontend
- **React 19** : Framework JavaScript
- **TypeScript** : Typage strict
- **Vite** : Build tool et dev server
- **TailwindCSS** : Framework CSS
- **React Router** : Gestion des routes
- **Clerk React** : Intégration authentification
- **i18next** : Internationalisation
- **Formik + Yup** : Gestion des formulaires
- **Socket.io Client** : Communication temps réel

## Prérequis

- **Node.js** (v18 ou supérieur)
- **npm** ou **yarn**
- **MySQL** ou **MariaDB** pour la base de données
- **Compte Clerk** pour l'authentification

## Installation et Démarrage

### 1. Cloner le projet
```bash
git clone <repository-url>
cd LAMAISON
```

### 2. Backend
```bash
cd backend
npm install
```

#### Configuration des variables d'environnement
Créer un fichier `.env` à la racine du backend :
```env
DATABASE_URL="mysql://username:password@localhost:3306/lamaison"
CLERK_SECRET_KEY="votre_clerk_secret_key"
CLERK_PUBLISHABLE_KEY="votre_clerk_publishable_key"
CLERK_WEBHOOK_SECRET="votre_webhook_secret"
PORT=5000
```

#### Initialisation de la base de données
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Remplir la base de données avec des données de test
npx prisma db seed
```

#### Démarrage du serveur backend
```bash
# Mode développement
npm run dev

# Le serveur démarre sur http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
```

#### Configuration des variables d'environnement
Créer un fichier `.env` à la racine du frontend :
```env
VITE_CLERK_PUBLISHABLE_KEY="votre_clerk_publishable_key"
VITE_API_URL="http://localhost:5000"
```

#### Démarrage de l'application frontend
```bash
# Mode développement
npm run dev

# L'application démarre sur http://localhost:5173
```

## Commandes Utiles

### Backend
```bash
# Démarrer le serveur en développement
npm run dev

# Lancer les tests
npm test

# Générer le client Prisma
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Voir la base de données
npx prisma studio

# Réinitialiser la base de données
npx prisma migrate reset
```

### Frontend
```bash
# Démarrer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Lancer le linter
npm run lint

# Prévisualiser le build de production
npm run preview
```

### Prisma Commands
```bash
# Générer le client Prisma après modification du schéma
npx prisma generate

# Pousser les changements du schéma vers la base de données
npx prisma db push

# Voir le schéma de la base de données
npx prisma db pull

# Ouvrir l'interface Prisma Studio
npx prisma studio

# Créer une migration
npx prisma migrate dev --name init

# Réinitialiser la base de données
npx prisma migrate reset
```

## Structure de la Base de Données

### Modèles Principaux

#### User
- **id**, **clerkId**, **firstname**, **role**, **phone**, **avatar**
- Relations : favoris, messages (envoyés/reçus), annonces, rendez-vous

#### Annonce
- **id**, **titre**, **description**, **prix**, **ville**, **quartier**
- **surface**, **chambres**, **douches**, **vues**, **images**
- **type** (maison, appartement, terrain, etc.)
- **projet** (achat, location)
- Relations : propriétaire, favoris, rendez-vous

#### RendezVous
- **id**, **date**, **proposedDate**, **nom**, **prenom**
- **email**, **telephone**, **message**, **status**
- **status** : EN_ATTENTE, PROPOSE, ACCEPTE, REFUSE, ANNULE
- Relations : prospect, annonce

#### Message
- **id**, **senderId**, **receiverId**, **content**
- Relations : sender, receiver

#### Favori
- **id**, **userId**, **annonceId**
- Relations : user, annonce

#### Admin
- **id**, **name**, **email**, **password**, **role**

## Logique des Composants Principaux

### Frontend Components

#### AnnonceCard
- **Fonction** : Affiche une carte d'annonce avec image carousel
- **Props** : id, titre, ville, prix, images, chambres, douches, surface, etc.
- **Fonctionnalités** : 
  - Carousel d'images avec Swiper
  - Ajout/retrait des favoris
  - Navigation vers le détail de l'annonce
  - Affichage du nombre de vues

#### AnnonceForm
- **Fonction** : Formulaire de création/modification d'annonce
- **États** : formData, selectedFiles, previewUrls, isSubmitting
- **Fonctionnalités** :
  - Upload multiple d'images avec preview
  - Validation du formulaire avec Formik/Yup
  - Gestion des différents types de biens et projets
  - Sauvegarde automatique des brouillons

#### SearchBar
- **Fonction** : Barre de recherche avancée avec filtres
- **Filtres** : Ville, type de bien, prix, surface, chambres, etc.
- **Fonctionnalités** :
  - Recherche en temps réel
  - Sauvegarde des filtres dans l'URL
  - Auto-complétion pour les villes

#### RdvModal
- **Fonction** : Modal de prise de rendez-vous
- **Fonctionnalités** :
  - Sélection de date et heure
  - Formulaire de contact
  - Intégration avec le calendrier
  - Confirmation par email

### Backend Controllers

#### AnnonceController
- **createAnnonce** : Création d'une nouvelle annonce
- **getAnnonces** : Récupération paginée des annonces avec filtres
- **getAnnonceById** : Détail d'une annonce
- **updateAnnonce** : Mise à jour d'une annonce
- **deleteAnnonce** : Suppression d'une annonce
- **incrementViews** : Incrémentation du compteur de vues

#### AuthController
- **syncUser** : Synchronisation des utilisateurs Clerk avec la base locale
- **getUserProfile** : Récupération du profil utilisateur
- **updateProfile** : Mise à jour du profil

#### RdvController
- **createRdv** : Création d'une demande de rendez-vous
- **getRdvsByUser** : Rendez-vous d'un utilisateur
- **updateRdvStatus** : Mise à jour du statut d'un rendez-vous
- **getRdvsByAnnonce** : Rendez-vous pour une annonce

#### MessageController
- **sendMessage** : Envoi d'un message
- **getMessages** : Récupération des conversations
- **markAsRead** : Marquage des messages comme lus

## Gestion des Rôles et Permissions

### Rôles
- **ADMIN** : Accès complet à l'administration
- **AGENT** : Gestion des annonces et rendez-vous
- **PROSPECT** : Recherche, favoris, prise de rendez-vous

### Permissions
- Les agents peuvent créer/modifier leurs annonces
- Les prospects peuvent voir les annonces et prendre rendez-vous
- Les admins ont accès à toutes les fonctionnalités

## API Endpoints

### Authentification
- `POST /auth/sync` - Synchronisation utilisateur Clerk
- `GET /auth/profile` - Profil utilisateur

### Annonces
- `GET /annonces` - Liste des annonces (avec filtres)
- `GET /annonces/:id` - Détail d'une annonce
- `POST /annonces` - Créer une annonce
- `PUT /annonces/:id` - Mettre à jour une annonce
- `DELETE /annonces/:id` - Supprimer une annonce

### Rendez-vous
- `POST /rdvs` - Créer une demande de RDV
- `GET /rdvs/user/:userId` - RDV d'un utilisateur
- `PUT /rdvs/:id/status` - Mettre à jour le statut

### Messages
- `POST /messages` - Envoyer un message
- `GET /messages/:userId` - Conversation avec un utilisateur

### Favoris
- `POST /favoris` - Ajouter aux favoris
- `DELETE /favoris/:annonceId` - Retirer des favoris
- `GET /favoris/user/:userId` - Favoris d'un utilisateur

## Communication Temps Réel

### Socket.io Events
- **connection** : Connexion d'un utilisateur
- **sendMessage** : Envoi d'un message en temps réel
- **newRdv** : Notification de nouveau rendez-vous
- **rdvStatusUpdate** : Mise à jour du statut d'un RDV
- **userOnline** : Statut de connexion des utilisateurs

## Tests

### Tests Backend
```bash
npm test
```

### Tests Frontend
```bash
npm run test
```

## Déploiement

### Backend (Production)
1. Builder l'application : `npm run build`
2. Configurer les variables d'environnement de production
3. Appliquer les migrations : `npx prisma migrate deploy`
4. Démarrer le serveur

### Frontend (Production)
1. Builder l'application : `npm run build`
2. Déployer le dossier `dist` sur un serveur web
3. Configurer le reverse proxy pour rediriger les requêtes API

## Dépannage

### Problèmes Communs
- **Erreur de connexion à la base de données** : Vérifier DATABASE_URL et que MySQL/MariaDB est démarré
- **Erreur Clerk** : Vérifier les clés API dans les variables d'environnement
- **Images ne s'affichent pas** : Vérifier que le dossier uploads existe et les permissions

### Logs
- Backend : Console du serveur Node.js
- Frontend : Console du navigateur et onglet Network
- Base de données : `npx prisma studio` pour inspecter les données

## Contributeurs

- Gilles - Développeur principal

---

**Note** : Ce README est un document vivant. N'hésitez pas à le mettre à jour avec de nouvelles informations ou corrections.
