// import { PrismaClient } from '@repo/db/client'
import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from "@prisma/adapter-pg";
import { dotenv } from "@repo/common-utils";
dotenv.config();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prismaClient = new PrismaClient({ adapter })

// Export Zod schemas for use in backend and frontend
export * from '../prisma/generated/schemas'
