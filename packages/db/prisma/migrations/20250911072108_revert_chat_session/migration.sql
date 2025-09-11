-- CreateEnum
CREATE TYPE "public"."ChatSessionStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "chatSessionId" TEXT;

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

-- CreateIndex
CREATE INDEX "chat-sessions_studentId_idx" ON "public"."chat-sessions"("studentId");

-- CreateIndex
CREATE INDEX "chat-sessions_classroomId_idx" ON "public"."chat-sessions"("classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "chat-sessions_studentId_classroomId_key" ON "public"."chat-sessions"("studentId", "classroomId");

-- CreateIndex
CREATE INDEX "messages_chatSessionId_idx" ON "public"."messages"("chatSessionId");

-- CreateIndex
CREATE INDEX "messages_lessonId_chatSessionId_idx" ON "public"."messages"("lessonId", "chatSessionId");

-- AddForeignKey
ALTER TABLE "public"."chat-sessions" ADD CONSTRAINT "chat-sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat-sessions" ADD CONSTRAINT "chat-sessions_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat-sessions" ADD CONSTRAINT "chat-sessions_studentClassroomId_fkey" FOREIGN KEY ("studentClassroomId") REFERENCES "public"."student-classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "public"."chat-sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
