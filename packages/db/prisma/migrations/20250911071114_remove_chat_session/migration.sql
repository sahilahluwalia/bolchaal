/*
  Warnings:

  - You are about to drop the column `chatSessionId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the `chat-sessions` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `senderId` on table `messages` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."chat-sessions" DROP CONSTRAINT "chat-sessions_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat-sessions" DROP CONSTRAINT "chat-sessions_studentClassroomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat-sessions" DROP CONSTRAINT "chat-sessions_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_chatSessionId_fkey";

-- DropIndex
DROP INDEX "public"."messages_chatSessionId_idx";

-- DropIndex
DROP INDEX "public"."messages_lessonId_chatSessionId_idx";

-- AlterTable
ALTER TABLE "public"."messages" DROP COLUMN "chatSessionId",
ALTER COLUMN "senderId" SET NOT NULL,
ALTER COLUMN "senderId" SET DEFAULT 'bot';

-- DropTable
DROP TABLE "public"."chat-sessions";

-- DropEnum
DROP TYPE "public"."ChatSessionStatus";
