"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { trpc } from "../../../../../_trpc/client";

type LessonItem = {
  id: string;
  isActive: boolean;
  lesson: { id: string; title: string };
};

export default function StudentClassChatsPage({ params }: { params: Promise<{ id: string }> }) {
  const classId = use(params).id;

  const { data: lessons, isLoading } = trpc.getClassroomLessonsForStudent.useQuery(
    { classroomId: classId },
    { enabled: !!classId }
  );

  const sortedLessons = useMemo((): LessonItem[] => {
    const list = ((lessons || []) as LessonItem[]).slice();
    return list.sort((a: LessonItem, b: LessonItem) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1));
  }, [lessons]);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex h-full">
        {/* Chat List Sidebar: per-lesson thread */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Lesson Chats</h1>
            <p className="text-sm text-gray-600">Each lesson has its own chat thread</p>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading lessons...</div>
            ) : (
              (sortedLessons || []).map((item: LessonItem) => (
                <Link
                  key={item.lesson.id}
                  href={`/dashboard/student/chats/class/${classId}/lesson/${item.lesson.id}`}
                  className="block p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {item.lesson.title.split(' ').map((word: string) => word[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.lesson.title}
                        </h3>
                        {item.isActive && (
                          <span className="text-xs font-medium text-green-600">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">Lesson thread</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right panel prompt to select a lesson */}
        <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a lesson</h3>
            <p className="text-gray-600">Choose a lesson from the sidebar to view its chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}


