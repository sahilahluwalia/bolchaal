-- CreateTable
CREATE TABLE "public"."lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "speakingModeOnly" BOOLEAN NOT NULL DEFAULT false,
    "keyVocabulary" TEXT NOT NULL,
    "keyGrammar" TEXT NOT NULL,
    "studentTask" TEXT NOT NULL,
    "reminderMessage" TEXT NOT NULL,
    "otherInstructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."lessons" ADD CONSTRAINT "lessons_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
