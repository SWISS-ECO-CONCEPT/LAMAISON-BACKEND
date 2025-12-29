import { defineConfig, env } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})










// // prisma.config.ts
// import "dotenv/config";
// import path from "node:path";
// import { defineConfig, env } from "prisma/config";

// export default defineConfig({
//   // chemin vers le fichier schema.prisma
//   schema: path.join("prisma", "schema.prisma"),

//   // config pour les migrations
//   migrations: {
//     path: path.join("prisma", "migrations"),
//   },

//   // config de la datasource (base de données)
//   datasource: {
//     url: env("DB_URL"),
   
//   },


// });
