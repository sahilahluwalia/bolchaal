
import Link from "next/link";
import Client from './client'
export default function LessonsPage() {
  
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
      <Client/>
      
    </div>
  );
}
