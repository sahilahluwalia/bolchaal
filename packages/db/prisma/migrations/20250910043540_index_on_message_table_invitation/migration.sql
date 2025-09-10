-- CreateIndex
CREATE INDEX "messages_classroomId_idx" ON "public"."messages"("classroomId");

-- CreateIndex
CREATE INDEX "messages_chatSessionId_idx" ON "public"."messages"("chatSessionId");
