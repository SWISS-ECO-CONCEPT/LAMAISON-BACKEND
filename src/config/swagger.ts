import swaggerJsdoc from "swagger-jsdoc";

// swagger-jsdoc lit les commentaires JSDoc au-dessus des routes (voir plus bas)
// et génère automatiquement la spec OpenAPI — pas besoin de dupliquer
// manuellement chaque endpoint dans un fichier séparé, la doc reste collée
// au code qu'elle décrit et évolue avec lui.
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LAMAISON API",
      version: "1.0.0",
      description: "Documentation de l'API LAMAISON (annonces, favoris, rendez-vous, messagerie, panel admin).",
    },
    servers: [
      {
        url: "/api/v1",
        description: "API versionnée",
      },
    ],
    components: {
      securitySchemes: {
        // Le frontend envoie le token Clerk dans le header Authorization: Bearer <token>
        // sur toutes les routes protégées par requireAuth(). On déclare ce schéma une
        // fois ici, puis chaque route protégée y fait juste référence avec "security".
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // Schéma générique du format de réponse uniforme — réutilisé dans
        // les annotations de routes via $ref au lieu de le redéfinir partout.
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            message: { type: "string" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                message: { type: "string" },
                code: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  // Fichiers scannés pour y trouver les commentaires JSDoc @openapi.
  apis: ["./src/routes/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);