"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { trpc } from "../../../../../_trpc/client";
import { toast } from "sonner";

// Type definitions for better type safety
interface ClassroomLesson {
  classroomId: string;
  lessonId: string;
  classroom: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
  };
  createdAt: Date;
}

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  studentCount: number;
  chatSessionCount: number;
}

interface AttachedClassroom {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  attachedAt: Date;
}

export default function AssignLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: lesson, isLoading: isLoadingLesson } = trpc.getLesson.useQuery(
    { id: lessonId },
    { enabled: !!lessonId }
  );

  const { data: classrooms, isLoading: isLoadingClassrooms } = trpc.getClassrooms.useQuery();

  const assignLessonMutation = trpc.attachLessonToClassroom.useMutation();
  const detachLessonMutation = trpc.detachLessonFromClassroom.useMutation();

  // Get IDs of already attached classrooms
  const attachedClassroomIds = lesson?.classroomLessons?.map((cl: ClassroomLesson) => cl.classroomId) || [];

  // Filter out already attached classrooms
  const availableClassrooms = classrooms?.filter((classroom: Classroom) =>
    !attachedClassroomIds.includes(classroom.id)
  ) || [];

  // Get attached classrooms with details
  const attachedClassrooms: AttachedClassroom[] = lesson?.classroomLessons?.map((cl: ClassroomLesson) => ({
    id: cl.classroomId,
    name: cl.classroom.name,
    description: cl.classroom.description,
    createdAt: cl.classroom.createdAt,
    attachedAt: cl.createdAt,
  })) || [];

  const handleClassroomToggle = (classroomId: string) => {
    setSelectedClassrooms(prev =>
      prev.includes(classroomId)
        ? prev.filter(id => id !== classroomId)
        : [...prev, classroomId]
    );
  };

  const handleSubmit = async () => {
    if (selectedClassrooms.length === 0) return;

    setIsSubmitting(true);
    let successCount = 0;
    let alreadyAttachedCount = 0;

    try {
      // Assign lesson to all selected classrooms
      const results = await Promise.allSettled(
        selectedClassrooms.map(classroomId =>
          assignLessonMutation.mutateAsync({
            classroomId,
            lessonId,
          })
        )
      );

      // Count successes and handle errors
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          const error = result.reason;
          if (error?.data?.code === 'CONFLICT' || error?.message?.includes('already attached')) {
            alreadyAttachedCount++;
          } else {
            console.error("Failed to assign lesson to classroom:", error);
          }
        }
      });

      // Show appropriate success message
      if (successCount > 0) {
        toast.success(`Successfully assigned lesson to ${successCount} classroom${successCount !== 1 ? 's' : ''}!`);
      }

      // Show warning for already attached classrooms
      if (alreadyAttachedCount > 0) {
        toast.warning(`${alreadyAttachedCount} classroom${alreadyAttachedCount !== 1 ? 's were' : ' was'} already assigned to this lesson.`);
      }

      // Redirect if any assignments were successful
      if (successCount > 0) {
        router.push(`/dashboard/teacher/lessons/${lessonId}`);
      }
    } catch (error) {
      console.error("Failed to assign lesson:", error);
      toast.error("Failed to assign lesson. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetachLesson = async (classroomId: string) => {
    try {
      await detachLessonMutation.mutateAsync({
        classroomId,
        lessonId,
      });
      toast.success("Lesson detached from classroom successfully!");
      // The mutations will automatically invalidate and refetch the queries
    } catch (error) {
      console.error("Failed to detach lesson:", error);
      toast.error("Failed to detach lesson. Please try again.");
    }
  };

  if (isLoadingLesson) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Lesson Not Found</h2>
          <p className="text-gray-600 mb-4">The lesson you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/dashboard/teacher/lessons"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Lessons
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
          <h1 className="text-2xl font-bold text-gray-900">Assign Lesson</h1>
          <p className="text-gray-600 mt-1">
            Assign <span className="font-medium">&quot;{lesson.title}&quot;</span> to classrooms
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/teacher/lessons/${lessonId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={selectedClassrooms.length === 0 || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? "Assigning..." : `Assign to ${selectedClassrooms.length} Classroom${selectedClassrooms.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>

      {/* Lesson Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">{lesson.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{lesson.purpose}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              lesson.speakingModeOnly
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}>
              {lesson.speakingModeOnly ? "Speaking Only" : "Full Lesson"}
            </span>
            <span className="text-sm text-gray-500">
              Created {new Date(lesson.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Show attached classrooms count */}
        {lesson?.classroomLessons && lesson.classroomLessons.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Already attached to {lesson.classroomLessons.length} classroom{lesson.classroomLessons.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Currently Attached Classrooms */}
      {attachedClassrooms.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Currently Attached Classrooms</h2>
              <p className="text-sm text-gray-600">
                This lesson is already assigned to these classrooms. You can detach it if needed.
              </p>
            </div>

            <div className="space-y-4">
              {attachedClassrooms.map((classroom: AttachedClassroom) => (
                <div
                  key={classroom.id}
                  className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg bg-green-50"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {classroom.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {classroom.description || "No description"}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Attached {new Date(classroom.attachedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDetachLesson(classroom.id)}
                    disabled={detachLessonMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {detachLessonMutation.isPending ? "Detaching..." : "Detach"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Classrooms */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Available Classrooms</h2>
            <p className="text-sm text-gray-600">
              Select classrooms to assign this lesson to. The lesson will be made available to students in these classrooms.
            </p>
          </div>

          {isLoadingClassrooms ? (
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
          ) : availableClassrooms && availableClassrooms.length > 0 ? (
            <div className="space-y-4">
              {availableClassrooms.map((classroom: Classroom) => (
                <div
                  key={classroom.id}
                  className={`flex items-start space-x-4 p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                    selectedClassrooms.includes(classroom.id)
                      ? "bg-indigo-50 border-indigo-300"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleClassroomToggle(classroom.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedClassrooms.includes(classroom.id)}
                    onChange={() => handleClassroomToggle(classroom.id)}
                    className="mt-1 w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {classroom.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {classroom.description || "No description"}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {classroom.studentCount} students
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {classroom.chatSessionCount} sessions
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : classrooms && classrooms.length > 0 && availableClassrooms.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">All classrooms already assigned</h3>
              <p className="mt-1 text-sm text-gray-500">
                This lesson is already assigned to all your classrooms.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/teacher/classrooms/create"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Classroom
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classrooms available</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven&apos;t created any classrooms yet.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/teacher/classrooms/create"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Classroom
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedClassrooms.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-indigo-900">
                {selectedClassrooms.length} classroom{selectedClassrooms.length !== 1 ? 's' : ''} selected
              </h3>
              <p className="text-sm text-indigo-700">
                This lesson will be assigned to the selected classrooms and made available to their students.
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? "Assigning..." : "Assign Lesson"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
