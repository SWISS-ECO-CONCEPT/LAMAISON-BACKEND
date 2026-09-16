import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Charge .env.test au lieu de .env pour tous les tests — évite de polluer
    // ta vraie base de dev pendant que les tests tournent.
    env: {
      NODE_ENV: "test",
    },
    setupFiles: ["./tests/setup.ts"],
    // Les tests d'intégration tapent une vraie base de données : on les exécute
    // en série, pas en parallèle, pour éviter que deux tests se marchent dessus
    // sur les mêmes lignes.
    fileParallelism: false,
    testTimeout: 15000,
  },
});