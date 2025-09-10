/*
  Warnings:

  - Added the required column `lessonId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "lessonId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "messages_lessonId_idx" ON "public"."messages"("lessonId");

-- CreateIndex
CREATE INDEX "messages_classroomId_lessonId_idx" ON "public"."messages"("classroomId", "lessonId");

-- CreateIndex
CREATE INDEX "messages_lessonId_chatSessionId_idx" ON "public"."messages"("lessonId", "chatSessionId");
