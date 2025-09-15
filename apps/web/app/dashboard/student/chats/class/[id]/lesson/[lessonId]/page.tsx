"use client";

import { use } from "react";
import React from "react";
import Link from "next/link";
import { trpc } from "../../../../../../../_trpc/client";
import { ChatInterface } from "../../../../../../../components/chat-interface";

type LessonItem = {
  id: string;
  isActive: boolean;
  lesson: { id: string; title: string };
  chatSessionId: string;
};

export default function StudentClassLessonChatPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: classId, lessonId } = use(params);

  const { data: lessons, isLoading } =
    trpc.getClassroomLessonsForStudent.useQuery(
      { classroomId: classId },
      { enabled: !!classId }
    );
  console.log("yesing");
  const currentLesson =
    ((lessons || []) as LessonItem[]).find(
      (l: LessonItem) => l.lesson.id === lessonId
    ) || null;

  return (
    <div className="h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar with lessons */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">
              Lesson Chats
            </h1>
            <p className="text-sm text-gray-600">
              Each lesson has its own chat thread
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-gray-500">
                Loading lessons...
              </div>
            ) : (
              ((lessons || []) as LessonItem[]).map((item: LessonItem) => (
                <Link
                  key={item.lesson.id}
                  href={`/dashboard/student/chats/class/${classId}/lesson/${item.lesson.id}`}
                  className={`block p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    lessonId === item.lesson.id
                      ? "bg-indigo-50 border-r-2 border-r-indigo-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {item.lesson.title
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.lesson.title}
                        </h3>
                        {item.isActive && (
                          <span className="text-xs font-medium text-green-600">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        Lesson thread
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          {/* Feedback command note at bottom */}
          <div className="p-4 border-t border-gray-200">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">
                💡 Pro tip:
              </p>
              <p className="text-xs text-blue-700">
                Use <span className="font-mono font-semibold">!feedback</span> to get feedback on your work, or chat normally with the AI bot!
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1">
          {currentLesson ? (
            <ChatInterface
              chatSessionId={currentLesson.chatSessionId}
              chatName={currentLesson.lesson.title}
              classId={classId}
              lessonId={lessonId}
              className="h-full"
              isDisabled={!currentLesson.isActive}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a lesson
                </h3>
                <p className="text-gray-600">
                  Choose a lesson from the sidebar to view its chat
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
