"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "../../../../_trpc/client";
import { Button } from "@repo/ui/button";
import { Dialog, DialogActions } from "@repo/ui/dialog";

export default function ClassroomDetailsPage() {
  const params = useParams();
  const classroomId = params.id as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lessonToDetach, setLessonToDetach] = useState<{ id: string; title: string } | null>(null);
  const [studentToRemove, setStudentToRemove] = useState<{ id: string; name: string | null; email: string } | null>(null);

  const { data: classroom, isLoading, error, refetch } = trpc.getClassroom.useQuery(
    { id: classroomId },
    { enabled: !!classroomId }
  );

  const detachLessonMutation = trpc.detachLessonFromClassroom.useMutation();
  const setActiveLessonMutation = trpc.setActiveLessonForClassroom.useMutation();
  const deleteClassroomMutation = trpc.deleteClassroom.useMutation();
  const detachStudentMutation = trpc.detachStudentFromClassroom.useMutation();

  const handleDetachLesson = (lessonId: string, title: string) => {
    console.log("Frontend: Handle detach lesson called", {
      lessonId,
      title,
      classroomId,
      classroomLessonId: lessonId // This should now be the actual lesson ID
    });
    setLessonToDetach({ id: lessonId, title });
  };

  const confirmDetachLesson = async () => {
    if (!lessonToDetach) return;

    console.log("Frontend: Detaching lesson", {
      classroomId,
      lessonId: lessonToDetach.id,
      lessonTitle: lessonToDetach.title
    });

    try {
      await detachLessonMutation.mutateAsync({
        classroomId,
        lessonId: lessonToDetach.id,
      });

      console.log("Frontend: Detach successful");
      // Refresh the classroom data
      refetch();
      setLessonToDetach(null);
    } catch (error) {
      console.error("Frontend: Failed to detach lesson:", error);
    }
  };

  const cancelDetach = () => {
    setLessonToDetach(null);
  };

  const handleRemoveStudent = (studentId: string, name: string | null, email: string) => {
    setStudentToRemove({ id: studentId, name, email });
  };

  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;
    try {
      await detachStudentMutation.mutateAsync({ classroomId, studentId: studentToRemove.id });
      await refetch();
      setStudentToRemove(null);
    } catch (e) {
      console.error("Failed to remove student", e);
    }
  };

  const makeActive = async (lessonId: string) => {
    try {
      await setActiveLessonMutation.mutateAsync({ classroomId, lessonId });
      await refetch();
    } catch (e) {
      console.error("Failed to activate lesson", e);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Classroom not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The classroom you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <div className="mt-6">
          <Link href="/dashboard/teacher/classrooms">
            <Button>Back to Classrooms</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/teacher/classrooms">
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{classroom.name}</h1>
          </div>
          <p className="text-gray-600">{classroom.description || "No description provided"}</p>
          <p className="text-sm text-gray-500 mt-1">Created {formatDate(classroom.createdAt)}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/teacher/classrooms/${classroomId}/edit`}>
            <Button variant="outline">Edit Classroom</Button>
          </Link>
          <Link href={`/dashboard/teacher/classrooms/${classroomId}/attach-lesson`}>
            <Button variant="outline">Attach Lesson</Button>
          </Link>
          <Link href={`/dashboard/teacher/classrooms/${classroomId}/attach-students`}>
            <Button variant="outline">Manage Students</Button>
          </Link>
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <Link
                    href={`/dashboard/teacher/classrooms/${classroomId}/edit`}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Classroom
                  </Link>
                  <button
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Classroom
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Students</p>
              <p className="text-2xl font-semibold text-gray-900">{classroom.studentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lessons</p>
              <p className="text-2xl font-semibold text-gray-900">{classroom.ClassroomLesson.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chat Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">{classroom.chatSessionCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{classroom.messageCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Students */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Enrolled Students</h3>
            <Link href={`/dashboard/teacher/classrooms/${classroomId}/attach-students`}>
              <Button variant="outline" size="sm">Manage Students</Button>
            </Link>
          </div>
          {classroom.enrollments.length > 0 ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {classroom.enrollments.slice(0, 5).map((enrollment: any) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-700">
                        {enrollment.student.name?.charAt(0)?.toUpperCase() || enrollment.student.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {enrollment.student.name || "Unnamed Student"}
                      </p>
                      <p className="text-xs text-gray-500">{enrollment.student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{formatDate(enrollment.enrolledAt)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveStudent(enrollment.student.id, enrollment.student.name, enrollment.student.email)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {classroom.enrollments.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  And {classroom.enrollments.length - 5} more students...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-sm text-gray-500 mt-2">No students enrolled yet</p>
            </div>
          )}
        </div>

        {/* Attached Lessons */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Attached Lessons</h3>
              <p className="text-sm text-gray-600">You can attach multiple lessons, but only one can be active at a time.</p>
            </div>
            <Link href={`/dashboard/teacher/classrooms/${classroomId}/attach-lesson`}>
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Attach Lesson
              </Button>
            </Link>
          </div>
          {classroom.ClassroomLesson.length > 0 ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {classroom.ClassroomLesson.map((classroomLesson: any) => (
                <div key={classroomLesson.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {classroomLesson.lesson.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {classroomLesson.lesson.purpose}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            Created {new Date(classroomLesson.lesson.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            classroomLesson.lesson.speakingModeOnly
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {classroomLesson.lesson.speakingModeOnly ? "Speaking Only" : "Full Lesson"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                  {!classroomLesson.isActive && (
                      <Button
                        size="sm"
                        onClick={() => makeActive(classroomLesson.lesson.id)}
                        disabled={setActiveLessonMutation.isPending}
                        className="hover:text-indigo-50 hover:bg-indigo-700 bg-indigo-50 text-indigo-600"
                        title="Make this the active lesson"
                      >
                        {setActiveLessonMutation.isPending ? "Activating..." : "Make Active"}
                      </Button>
                    )}
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      classroomLesson.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {classroomLesson.isActive ? "Active" : "Inactive"}
                    </div>
                   
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDetachLesson(classroomLesson.lesson.id, classroomLesson.lesson.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Detach lesson from classroom"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons attached</h3>
              <p className="text-sm text-gray-500 mb-4">Attach lessons to make them available to students in this classroom.</p>
              <Link href={`/dashboard/teacher/classrooms/${classroomId}/attach-lesson`}>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Attach Your First Lesson
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Chat Sessions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Chat Sessions</h3>
          <Button variant="outline" size="sm">View All Sessions</Button>
        </div>
        {classroom.ChatSession.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {classroom.ChatSession.slice(0, 10).map((session: any) => {
                  return (
                    <tr key={session.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-indigo-700">
                              {session.student.name?.charAt(0)?.toUpperCase() || session.student.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {session.student.name || "Unnamed Student"}
                            </p>
                            <p className="text-xs text-gray-500">{session.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          session.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : session.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(session.startedAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/dashboard/teacher/students/${session.student.id}/chat-sessions/${session.id}`}>
                          <Button variant="outline" size="sm">
                            See Chat
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-gray-500 mt-2">No chat sessions yet</p>
          </div>
        )}
      </div>



      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Classroom"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete <span className="font-medium">&ldquo;{classroom?.name}&rdquo;</span>?
            This will permanently remove the classroom and all associated data.
          </p>
        </div>

        <DialogActions
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            try {
              await deleteClassroomMutation.mutateAsync({ id: classroomId });
              window.location.href = '/dashboard/teacher/classrooms';
            } catch (error) {
              console.error("Failed to delete classroom:", error);
            }
          }}
          cancelText="Cancel"
          confirmText="Delete Classroom"
        />
      </Dialog>

      {/* Detach Lesson Confirmation Dialog */}
      <Dialog
        isOpen={!!lessonToDetach}
        onClose={cancelDetach}
        title="Detach Lesson"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Remove lesson from classroom</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700">
            Are you sure you want to detach <span className="font-medium">&ldquo;{lessonToDetach?.title}&rdquo;</span> from this classroom?
            Students will no longer have access to this lesson.
          </p>
        </div>

        <DialogActions
          onCancel={cancelDetach}
          onConfirm={confirmDetachLesson}
          cancelText="Cancel"
          confirmText={detachLessonMutation.isPending ? "Detaching..." : "Detach Lesson"}
          isLoading={detachLessonMutation.isPending}
        />
      </Dialog>

      {/* Remove Student Confirmation Dialog */}
      <Dialog
        isOpen={!!studentToRemove}
        onClose={() => setStudentToRemove(null)}
        title="Remove Student"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Remove student from classroom</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700">
            Are you sure you want to remove
            {" "}
            <span className="font-medium">{studentToRemove?.name || studentToRemove?.email}</span>
            {" "}
            from this classroom? This will also remove any active chat sessions in this class.
          </p>
        </div>

        <DialogActions
          onCancel={() => setStudentToRemove(null)}
          onConfirm={confirmRemoveStudent}
          cancelText="Cancel"
          confirmText={detachStudentMutation.isPending ? "Removing..." : "Remove Student"}
          isLoading={detachStudentMutation.isPending}
        />
      </Dialog>
    </div>
  );
}
