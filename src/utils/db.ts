import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/prisma/client'

const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://root:342021@localhost:3306/lamaison')

const adapter = new PrismaMariaDb({
  // host: 'localhost',
  // port: 3306,
  // user: 'root',
  // password: '342021',
  // database: 'lamaison',
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  connectionLimit: 5
})
export const prisma = new PrismaClient({ adapter })









// import "dotenv/config";
// import { PrismaPg } from '@prisma/adapter-pg'
// import { PrismaClient } from '../../generated/prisma/client'

// const connectionString = `${process.env.DB_URL}`

// const adapter = new PrismaPg({ connectionString })
// const prisma = new PrismaClient({ adapter })

// export { prisma }













