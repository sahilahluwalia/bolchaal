"use client";

import Link from "next/link";
import { trpc } from "../../../_trpc/client";

export default function StudentChatsPage() {
  type MyClassroom = { id: string; name: string; teacherName?: string | null };
  const { data: myClassrooms, isLoading } = trpc.getMyClassrooms.useQuery();

  return (
    <div className="h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex h-full">
        <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Your Classes</h1>
            <p className="text-sm text-gray-600">Pick a class to view lesson chats</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading classes...</div>
            ) : (myClassrooms || []).length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No classes yet</div>
            ) : (
              ((myClassrooms || []) as MyClassroom[]).map(cls => (
                <Link
                  key={cls.id}
                  href={`/dashboard/student/chats/class/${cls.id}`}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {cls.name.split(' ').map(w => w[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{cls.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{cls.teacherName || 'Teacher'}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a class</h3>
            <p className="text-gray-600">Choose a class from the left to open its lesson chats</p>
          </div>
        </div>
      </div>
    </div>
  );
}
