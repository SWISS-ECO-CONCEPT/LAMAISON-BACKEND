import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

const connectionString = `${process.env.DB_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }















// import {PrismaClient} from "../generated/prisma/client";
// const  prisma = new PrismaClient() 
// export default prisma 

// src/utils/db.ts
// import { PrismaClient } from  "../../generated/prisma"

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }

// export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// src/utils/db.ts (Example of a robust, standard implementation)

// import { PrismaClient } from "../../generated/prisma";

// // Add Prisma Client to the NodeJS global type to make it accessible across reloads in development
// declare global {  
//     var prisma: PrismaClient | undefined
// }

// // Use the global variable if it is already set, otherwise create a new instance
// export const prisma = global.prisma || new PrismaClient()


// // In development, store the prisma client globally to prevent multiple instances across hot reloads
// if (process.env.NODE_ENV !== 'production') global.prisma = prisma
