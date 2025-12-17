import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

// Prevent multiple instances of Prisma Client AND Pool in development
const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined,
  pool: Pool | undefined
}

// 1. Reuse existing pool or create a new one
const pool = globalForPrisma.pool || new Pool({ 
  connectionString,
  // Only use SSL for Neon/Vercel (Production), not local localhost
  ssl: process.env.NODE_ENV === 'production' ? true : undefined, 
})

// 2. Create Adapter
const adapter = new PrismaPg(pool)

// 3. Reuse existing client or create a new one with the adapter
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

// 4. Save instances to global scope in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}

export default prisma