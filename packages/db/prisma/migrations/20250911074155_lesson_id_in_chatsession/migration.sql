/*
  Warnings:

  - A unique constraint covering the columns `[studentId,classroomId,lessonId]` on the table `chat-sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."chat-sessions_studentId_classroomId_key";

-- AlterTable
ALTER TABLE "public"."chat-sessions" ADD COLUMN     "lessonId" TEXT NOT NULL DEFAULT 'a4e8efaa-7f3b-4f47-bd62-5945a29a0092';

-- CreateIndex
CREATE INDEX "chat-sessions_lessonId_idx" ON "public"."chat-sessions"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "chat-sessions_studentId_classroomId_lessonId_key" ON "public"."chat-sessions"("studentId", "classroomId", "lessonId");
