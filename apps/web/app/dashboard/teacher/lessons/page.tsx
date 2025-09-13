
import Link from "next/link";
import { Button } from "@repo/ui/button";
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
        <Link href="/dashboard/teacher/lessons/create">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Lesson
          </Button>
        </Link>
      </div>
      <Client/>
      
    </div>
  );
}
