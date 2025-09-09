"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import {InputField} from "@repo/ui/input-field";
interface LessonFormData {
  title: string;
  purpose: string;
  speakingModeOnly: boolean;
  keyVocabulary: string;
  keyGrammar: string;
  studentTask: string;
  reminderMessage: string;
  autoCheckIfLessonCompleted: boolean;
  otherInstructions: string;
}

export default function CreateLessonPage() {
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

  const handleInputChange = (field: keyof LessonFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement lesson creation API call
      console.log("Creating lesson:", formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to lessons list on success
      window.location.href = "/dashboard/teacher/lessons";
    } catch (error) {
      console.error("Error creating lesson:", error);
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
