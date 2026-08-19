# Image de base : Node.js version 20, variante "slim" = Debian allégé
# (plus petite que l'image par défaut, mais garde un vrai système Linux,
# ce qui est plus fiable qu'"alpine" pour des packages natifs comme bcrypt).
FROM node:20-slim AS base

# Dossier de travail à l'intérieur du conteneur : toutes les commandes
# suivantes (COPY, RUN, CMD) s'exécutent depuis /app.
WORKDIR /app

# On copie d'abord SEULEMENT les fichiers de dépendances, pas tout le code.
# Astuce Docker : tant que package.json ne change pas, Docker réutilise le
# cache et ne refait pas `npm install` à chaque petite modif de code.
COPY package.json package-lock.json ./

# Installe toutes les dépendances (y compris devDependencies, car on a besoin
# de tsx, typescript et prisma pour faire tourner/générer des trucs).
RUN npm install

# Le client Prisma est généré à partir du schéma (prisma/schema.prisma).
# Il faut le schéma pour générer ce client, donc on le copie avant.
COPY prisma ./prisma
RUN npx prisma generate

# Maintenant seulement, on copie le reste du code source de l'application.
COPY . .

# Le serveur écoute sur ce port à l'intérieur du conteneur (voir server.ts).
# EXPOSE est juste documentaire : ça ne publie rien tout seul,
# c'est docker-compose qui fera le vrai mapping de port plus tard.
EXPOSE 5000

# Commande lancée quand le conteneur démarre : exécute le serveur
# directement en TypeScript via tsx (pas besoin d'étape de compilation).
CMD ["npx", "tsx", "src/server.ts"]