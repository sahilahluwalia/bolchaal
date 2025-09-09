"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@repo/ui/button";

interface Lesson {
  id: string;
  title: string;
  purpose: string;
  speakingModeOnly: boolean;
  keyVocabulary: string;
  keyGrammar: string;
  studentTask: string;
  reminderMessage: string;
  autoCheckIfLessonCompleted: boolean;
  otherInstructions: string;
  createdAt: string;
  classroom: string;
}

export default function LessonDetailsPage() {
  const params = useParams();
  const lessonId = params.id as string;

  // Mock lesson data - in a real app, this would be fetched from API
  const [lesson] = useState<Lesson>({
    id: lessonId,
    title: "Introduction to English Grammar",
    purpose: "To help students understand basic sentence structure and grammar rules",
    speakingModeOnly: false,
    keyVocabulary: "noun, verb, adjective, preposition, conjunction",
    keyGrammar: "subject-verb agreement, present simple tense",
    studentTask: "Complete the interactive exercises and practice forming sentences using the vocabulary provided",
    reminderMessage: "Remember to focus on correct word order in your sentences",
    autoCheckIfLessonCompleted: true,
    otherInstructions: "Take your time with each exercise. Practice speaking aloud when possible.",
  createdAt: "2024-01-15",
  classroom: "English 101",
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      // TODO: Implement lesson deletion API call
      console.log("Deleting lesson:", lessonId);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to lessons list on success
      window.location.href = "/dashboard/teacher/lessons";
    } catch (error) {
      console.error("Error deleting lesson:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="text-gray-600 mt-1">Lesson Details</p>
        </div>
        <Link
          href="/dashboard/teacher/lessons"
          className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
        >
          ← Back to Lessons
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/teacher/lessons/${lessonId}/edit`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
        >
          Edit Lesson
        </Link>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          {isDeleting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
              Deleting...
            </div>
          ) : (
            "Delete Lesson"
          )}
        </Button>
      </div>

      {/* Lesson Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purpose */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Purpose</h2>
            <p className="text-gray-700 leading-relaxed">{lesson.purpose}</p>
          </div>

          {/* Student Task */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Student Task</h2>
            <p className="text-gray-700 leading-relaxed">{lesson.studentTask}</p>
          </div>

          {/* Learning Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Key Vocabulary</h3>
                <p className="text-gray-700 text-sm">{lesson.keyVocabulary}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Key Grammar</h3>
                <p className="text-gray-700 text-sm">{lesson.keyGrammar}</p>
              </div>
            </div>
          </div>

          {/* Additional Instructions */}
          {(lesson.otherInstructions || lesson.reminderMessage) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-4">
                {lesson.reminderMessage && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Reminder Message</h3>
                    <p className="text-gray-700 text-sm">{lesson.reminderMessage}</p>
                  </div>
                )}
                {lesson.otherInstructions && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Other Instructions</h3>
                    <p className="text-gray-700 text-sm">{lesson.otherInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lesson Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Settings</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Speaking Mode Only</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lesson.speakingModeOnly ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {lesson.speakingModeOnly ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto-check Completion</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lesson.autoCheckIfLessonCompleted ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {lesson.autoCheckIfLessonCompleted ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Classroom</span>
                <p className="font-medium text-gray-900">{lesson.classroom}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Created</span>
                <p className="font-medium text-gray-900">{lesson.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/dashboard/teacher/lessons/${lessonId}/assign`}
                className="block w-full px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors text-center font-medium"
              >
                Assign to Classroom
              </Link>
              <Link
                href={`/dashboard/teacher/lessons/${lessonId}/duplicate`}
                className="block w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-center font-medium"
              >
                Duplicate Lesson
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
