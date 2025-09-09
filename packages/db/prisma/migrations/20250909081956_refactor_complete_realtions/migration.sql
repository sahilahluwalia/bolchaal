/*
  Warnings:

  - A unique constraint covering the columns `[studentId,classroomId]` on the table `student-classroom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatSessionId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ChatSessionStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."lessons" ADD COLUMN     "autoCheckIfLessonCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "aiMetadata" JSONB,
ADD COLUMN     "aiPrompt" TEXT,
ADD COLUMN     "attachmentId" TEXT,
ADD COLUMN     "chatSessionId" TEXT NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "senderId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."classroom-lessons" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classroom-lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat-sessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "status" "public"."ChatSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentClassroomId" TEXT,

    CONSTRAINT "chat-sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message-attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message-attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "classroom-lessons_classroomId_lessonId_key" ON "public"."classroom-lessons"("classroomId", "lessonId");

-- CreateIndex
CREATE INDEX "chat-sessions_studentId_idx" ON "public"."chat-sessions"("studentId");

-- CreateIndex
CREATE INDEX "chat-sessions_classroomId_idx" ON "public"."chat-sessions"("classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "chat-sessions_studentId_classroomId_key" ON "public"."chat-sessions"("studentId", "classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "message-attachment_messageId_key" ON "public"."message-attachment"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "student-classroom_studentId_classroomId_key" ON "public"."student-classroom"("studentId", "classroomId");

-- AddForeignKey
ALTER TABLE "public"."classroom-lessons" ADD CONSTRAINT "classroom-lessons_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classroom-lessons" ADD CONSTRAINT "classroom-lessons_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat-sessions" ADD CONSTRAINT "chat-sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat-sessions" ADD CONSTRAINT "chat-sessions_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat-sessions" ADD CONSTRAINT "chat-sessions_studentClassroomId_fkey" FOREIGN KEY ("studentClassroomId") REFERENCES "public"."student-classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message-attachment" ADD CONSTRAINT "message-attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "public"."chat-sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
