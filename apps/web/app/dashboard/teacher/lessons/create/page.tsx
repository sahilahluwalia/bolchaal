"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import {InputField} from "@repo/ui/input-field";
import { trpc } from "../../../../_trpc/client";
import { toast } from "sonner";
import { LessonCreateInputObjectSchema } from "@repo/db/client";


type LessonFormData = typeof LessonCreateInputObjectSchema;
export default function CreateLessonPage() {

  const router = useRouter();
  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    purpose: "",
    speakingModeOnly: false,
    keyVocabulary: "",
    keyGrammar: "",
    studentTask: "",
    reminderMessage: "",
    autoCheckIfLessonCompleted: false,
    otherInstructions: "",
  });

  const [errors, setErrors] = useState<Partial<LessonFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<Partial<LessonFormData> | null>(null);
  const [showAiPreview, setShowAiPreview] = useState(false);

  // tRPC mutations
  const generateAIContent = trpc.generateAILessonContent.useMutation();
  const createLesson = trpc.createLesson.useMutation();

  const handleInputChange = (field: keyof LessonFormData, value: string | boolean) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev:typeof errors) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LessonFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = "Purpose is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateAIContent = async () => {
    if (!formData.title.trim() || !formData.purpose.trim()) {
      toast.error("Please fill in both title and purpose before generating AI content");
      return;
    }

    try {
      const result = await generateAIContent.mutateAsync({
        title: formData.title,
        purpose: formData.purpose,
      });

      const generatedData: Partial<LessonFormData> = {
        keyVocabulary: result.lessonContent.keyVocabulary,
        keyGrammar: result.lessonContent.keyGrammar,
        studentTask: result.lessonContent.studentTask,
        reminderMessage: result.lessonContent.reminderMessage,
        otherInstructions: result.lessonContent.otherInstructions,
      };

      setAiGeneratedContent(generatedData);
      setShowAiPreview(true);
      toast.success("AI content generated successfully! 👨‍💻");
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast.error("Failed to generate AI content. Please try again.");
    }
  };

  const handleApplyAIContent = () => {
    if (aiGeneratedContent) {
      setFormData((prev: typeof formData) => ({ ...prev, ...aiGeneratedContent }));
      setShowAiPreview(false);
      setAiGeneratedContent(null);
      toast.success("AI content applied to form! ✨");
    }
  };

  const handleDiscardAIContent = () => {
    setAiGeneratedContent(null);
    setShowAiPreview(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createLesson.mutateAsync({
        title: formData.title,
        purpose: formData.purpose,
        keyVocabulary: formData.keyVocabulary,
        keyGrammar: formData.keyGrammar,
        studentTask: formData.studentTask,
        reminderMessage: formData.reminderMessage,
        otherInstructions: formData.otherInstructions,
        speakingModeOnly: formData.speakingModeOnly,
        autoCheckIfLessonCompleted: formData.autoCheckIfLessonCompleted,
      });

      toast.success("Lesson created successfully! 🎉");
      router.push("/dashboard/teacher/lessons");
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Failed to create lesson. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Lesson</h1>
          <p className="text-gray-600 mt-1">Set up a new lesson for your students</p>
        </div>
        <Link
          href="/dashboard/teacher/lessons"
          className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
        >
          ← Back to Lessons
        </Link>
      </div>

      {/* AI Generation Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 ">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">🤖 AI-Powered Content Generation</h2>
            <p className="text-gray-600 text-sm mb-4">
              Let AI help you create lesson content! Fill in the title and purpose below, then click generate to get AI-suggested content for vocabulary, grammar, tasks, and instructions.
            </p>
            {!formData.title.trim() || !formData.purpose.trim() ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-yellow-800 text-sm">
                  📝 <strong>Tip:</strong> Title and purpose are required for AI generation
                </p>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleGenerateAIContent}
                disabled={generateAIContent.isPending}
                className="bg-gradient-to-r  from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {generateAIContent.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    ✨ Generate AI Content
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* AI Content Preview */}
      {showAiPreview && aiGeneratedContent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900">🎯 AI Generated Content</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleApplyAIContent}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Apply Content
              </Button>
              <Button
                type="button"
                onClick={handleDiscardAIContent}
                variant="outline"
                className="border-gray-300"
              >
                Discard
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <strong className="text-gray-700">Key Vocabulary:</strong>
              <p className="text-gray-600 mt-1">{aiGeneratedContent.keyVocabulary}</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <strong className="text-gray-700">Key Grammar:</strong>
              <p className="text-gray-600 mt-1">{aiGeneratedContent.keyGrammar}</p>
            </div>
            <div className="bg-white p-3 rounded border md:col-span-2">
              <strong className="text-gray-700">Student Task:</strong>
              <p className="text-gray-600 mt-1">{aiGeneratedContent.studentTask}</p>
            </div>
            <div className="bg-white p-3 rounded border md:col-span-2">
              <strong className="text-gray-700">Reminder Message:</strong>
              <p className="text-gray-600 mt-1">{aiGeneratedContent.reminderMessage}</p>
            </div>
            <div className="bg-white p-3 rounded border md:col-span-2">
              <strong className="text-gray-700">Other Instructions:</strong>
              <p className="text-gray-600 mt-1">{aiGeneratedContent.otherInstructions}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="title"
              name="title"
              label="Lesson Title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Introduction to English Grammar"
              required
              error={errors.title}
              className="md:col-span-2"
            />

            <div className="md:col-span-2">
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("purpose", e.target.value)}
                placeholder="Describe the main goal of this lesson..."
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.purpose ? "border-red-300" : "border-gray-300"
                }`}
                rows={3}
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Configuration</h2>
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                id="speakingModeOnly"
                name="speakingModeOnly"
                type="checkbox"
                checked={formData.speakingModeOnly}
                onChange={(e) => handleInputChange("speakingModeOnly", e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="speakingModeOnly" className="ml-2 block text-sm text-gray-900">
                Speaking Mode Only
                <span className="block text-xs text-gray-500 mt-1">
                  When enabled, students can only practice speaking without text input
                </span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="autoCheckIfLessonCompleted"
                name="autoCheckIfLessonCompleted"
                type="checkbox"
                checked={formData.autoCheckIfLessonCompleted}
                onChange={(e) => handleInputChange("autoCheckIfLessonCompleted", e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="autoCheckIfLessonCompleted" className="ml-2 block text-sm text-gray-900">
                Auto-check Lesson Completion
                <span className="block text-xs text-gray-500 mt-1">
                  Automatically mark lesson as completed when student finishes all tasks
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Learning Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="keyVocabulary"
              name="keyVocabulary"
              label="Key Vocabulary"
              type="text"
              value={formData.keyVocabulary}
              onChange={(e) => handleInputChange("keyVocabulary", e.target.value)}
              placeholder="e.g., noun, verb, adjective, preposition"
            />

            <InputField
              id="keyGrammar"
              name="keyGrammar"
              label="Key Grammar"
              type="text"
              value={formData.keyGrammar}
              onChange={(e) => handleInputChange("keyGrammar", e.target.value)}
              placeholder="e.g., present simple, past tense, conditionals"
            />

            <div className="md:col-span-2">
              <label htmlFor="studentTask" className="block text-sm font-medium text-gray-700 mb-1">
                Student Task
              </label>
              <textarea
                id="studentTask"
                name="studentTask"
                value={formData.studentTask}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("studentTask", e.target.value)}
                placeholder="Describe what the student needs to do in this lesson..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="reminderMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Message
              </label>
              <textarea
                id="reminderMessage"
                name="reminderMessage"
                value={formData.reminderMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("reminderMessage", e.target.value)}
                placeholder="Optional reminder message to show to students..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Additional Instructions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Instructions</h2>
          <div>
            <label htmlFor="otherInstructions" className="block text-sm font-medium text-gray-700 mb-1">
              Other Instructions
            </label>
            <textarea
              id="otherInstructions"
              name="otherInstructions"
              value={formData.otherInstructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("otherInstructions", e.target.value)}
              placeholder="Any additional instructions or notes for this lesson..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              rows={4}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 bg-white border border-gray-200 rounded-lg p-6">
          <Link
            href="/dashboard/teacher/lessons"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              "Create Lesson"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
