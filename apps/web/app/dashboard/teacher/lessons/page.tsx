"use client";

import Link from "next/link";

export default function LessonsPage() {
  // Mock data - in a real app, this would come from your API
  const lessons = [
    {
      id: "1",
      title: "Introduction to English Grammar",
      purpose: "To help students understand basic sentence structure",
      speakingModeOnly: false,
      classroom: "English 101",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Business Communication Skills",
      purpose: "Develop professional speaking and writing skills",
      speakingModeOnly: true,
      classroom: "Business English",
      createdAt: "2024-01-20",
    },
    {
      id: "3",
      title: "Advanced Vocabulary Building",
      purpose: "Expand academic and professional vocabulary",
      speakingModeOnly: false,
      classroom: "Advanced English",
      createdAt: "2024-01-25",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
          <p className="text-gray-600 mt-1">Manage and organize your teaching lessons</p>
        </div>
        <Link
          href="/dashboard/teacher/lessons/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Lesson
        </Link>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.purpose}</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {lesson.classroom}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Created {lesson.createdAt}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {lesson.speakingModeOnly ? "Speaking Only" : "Full Lesson"}
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/dashboard/teacher/lessons/${lesson.id}`}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-center"
              >
                View Details
              </Link>
              <Link
                href={`/dashboard/teacher/lessons/${lesson.id}/edit`}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-center"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {lessons.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first lesson</p>
          <Link
            href="/dashboard/teacher/lessons/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Lesson
          </Link>
        </div>
      )}
    </div>
  );
}
