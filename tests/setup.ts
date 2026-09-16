import { execSync } from "child_process";
import dotenv from "dotenv";

// Charge .env.test AVANT tout le reste — remplace le .env normal pendant les tests.
dotenv.config({ path: ".env.test", override: true });

// Applique les migrations Prisma sur la base de test avant de lancer la suite.
// "migrate deploy" (pas "migrate dev") : pas de prompt interactif, adapté au CI.
execSync("npx prisma migrate deploy", {
  env: { ...process.env },
  stdio: "inherit",
});