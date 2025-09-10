"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { trpc } from "../../../../../_trpc/client";
import { toast } from "sonner";

export default function AttachLessonPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;

  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: availableLessons, isLoading: isLoadingLessons, error: lessonsError } = trpc.getAvailableLessons.useQuery(
    { classroomId },
    {
      enabled: !!classroomId,
    }
  );

  const { data: classroom, isLoading: isLoadingClassroom } = trpc.getClassroom.useQuery(
    { id: classroomId },
    { enabled: !!classroomId }
  );

  // Debug: Also get all lessons to see what's available
  const { data: allLessons } = trpc.getLessons.useQuery();

  const attachLessonMutation = trpc.attachLessonToClassroom.useMutation();

  const handleLessonToggle = (lessonId: string) => {
    setSelectedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleSubmit = async () => {
    if (selectedLessons.length === 0) return;

    setIsSubmitting(true);
    try {
      // Attach all selected lessons
      await Promise.all(
        selectedLessons.map(lessonId =>
          attachLessonMutation.mutateAsync({
            classroomId,
            lessonId,
          })
        )
      );

      toast.success(`Successfully attached ${selectedLessons.length} lesson${selectedLessons.length !== 1 ? 's' : ''} to classroom!`);
      router.push(`/dashboard/teacher/classrooms/${classroomId}`);
    } catch (error) {
      console.error("Failed to attach lessons:", error);
      toast.error("Failed to attach lessons. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoadingClassroom) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Classroom Not Found</h2>
          <p className="text-gray-600 mb-4">The classroom you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/teacher/classrooms"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Classrooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attach Lessons</h1>
          <p className="text-gray-600 mt-1">
            Attach lessons to <span className="font-medium">&quot;{classroom.name}&quot;</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {classroom.ClassroomLesson?.length || 0} lesson{classroom.ClassroomLesson?.length !== 1 ? 's' : ''} already attached
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/teacher/classrooms/${classroomId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={selectedLessons.length === 0 || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? "Attaching..." : `Attach ${selectedLessons.length} Lesson${selectedLessons.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>

      {/* Currently Attached Lessons */}
      {classroom.ClassroomLesson && classroom.ClassroomLesson.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Currently Attached Lessons</h2>
            <p className="text-sm text-gray-600">
              These lessons are already available to students in this classroom.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classroom.ClassroomLesson.map((classroomLesson) => (
              <div key={classroomLesson.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {classroomLesson.lesson.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {classroomLesson.lesson.purpose}
                  </p>
                </div>
                <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  classroomLesson.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {classroomLesson.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Available Lessons</h2>
            <p className="text-sm text-gray-600">
              Select lessons to attach to this classroom. Only lessons you haven&apos;t already attached will be shown.
            </p>
          </div>

          {isLoadingLessons ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : lessonsError ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Lessons</h3>
              <p className="mt-1 text-sm text-gray-500">
                {lessonsError?.message || "Failed to load available lessons"}
              </p>
            </div>
          ) : availableLessons && availableLessons.length > 0 ? (
            <div className="space-y-4">
              {availableLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-start space-x-4 p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                    selectedLessons.includes(lesson.id)
                      ? "bg-indigo-50 border-indigo-300"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleLessonToggle(lesson.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedLessons.includes(lesson.id)}
                    onChange={() => handleLessonToggle(lesson.id)}
                    className="mt-1 w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {lesson.purpose}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        Created {formatDate(lesson.createdAt)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        lesson.speakingModeOnly
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {lesson.speakingModeOnly ? "Speaking Only" : "Full Lesson"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {/* <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Debug Info:</strong><br />
                  Classroom ID: {classroomId}<br />
                  Total Lessons: {allLessons?.length || 0}<br />
                  Available Lessons: {availableLessons?.length || 0}<br />
                  All Lessons: {allLessons ? allLessons.map(l => l.title).join(', ') : 'None'}<br />
                  Available Lessons: {availableLessons ? availableLessons.map(l => l.title).join(', ') : 'None'}
                </p>
              </div> */}
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No available lessons</h3>
              <p className="mt-1 text-sm text-gray-500">
                All your lessons are already attached to this classroom, or you haven&apos;t created any lessons yet.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/teacher/lessons/create"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Lesson
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedLessons.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-indigo-900">
                {selectedLessons.length} lesson{selectedLessons.length !== 1 ? 's' : ''} selected
              </h3>
              <p className="text-sm text-indigo-700">
                These lessons will be attached to the classroom and made available to students.
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? "Attaching..." : "Attach Lessons"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
