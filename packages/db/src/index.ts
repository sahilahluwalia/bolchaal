// import { PrismaClient } from '@repo/db/client'
import { PrismaClient } from '../generated/prisma'

export const prismaClient = new PrismaClient()

// Export Zod schemas for use in backend and frontend
export * from '../prisma/generated/schemas'
