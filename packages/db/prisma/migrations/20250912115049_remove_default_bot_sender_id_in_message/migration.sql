-- AlterTable
ALTER TABLE "public"."messages" ALTER COLUMN "senderId" DROP NOT NULL,
ALTER COLUMN "senderId" DROP DEFAULT;
