"use client";

import { useState } from "react";
import { trpc } from "../../../_trpc/client";
import { Button } from "@repo/ui/button";
import { Dialog, DialogActions } from "@repo/ui/dialog";
import Link from "next/link";

export default function TeacherClassroomsPage() {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deletingClassroom, setDeletingClassroom] = useState<{ id: string; name: string } | null>(null);

  const { data: classrooms, isLoading, refetch } = trpc.getClassrooms.useQuery();


  const handleDeleteClassroom = (classroom: { id: string; name: string }) => {
    setDeletingClassroom(classroom);
  };
  const deleteClassroomMutation = trpc.deleteClassroom.useMutation();
  const confirmDeleteClassroom = async () => {
    if (!deletingClassroom) return;

    try {
      deleteClassroomMutation.mutate({ id: deletingClassroom.id });
      refetch();
      setDeletingClassroom(null);
    } catch (error) {
      console.error("Failed to delete classroom:", error);
    }
  };

  const cancelDelete = () => {
    setDeletingClassroom(null);
  };

  // Close menu when clicking outside
  const handleContainerClick = (e: React.MouseEvent) => {
    if (!(e.target as Element).closest('.menu-container')) {
      setMenuOpen(null);
    }
  };

  return (
    <div className="space-y-6" onClick={handleContainerClick}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Classrooms</h1>
            <p className="text-gray-600">Manage your classroom spaces and student enrollments</p>
          </div>
          <Link href="/dashboard/teacher/classrooms/create">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Classroom
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Classroom Grid */}
        {!isLoading && classrooms && classrooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {classrooms.map((classroom: any) => (
              <div key={classroom.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {classroom.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{classroom.description || "No description"}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <span className="truncate">{classroom.studentCount} students</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="truncate">{classroom.chatSessionCount} sessions</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.location.href = `/dashboard/teacher/classrooms/${classroom.id}`}
                      >
                        View Details
                      </Button>
                      <div className="relative menu-container">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === classroom.id ? null : classroom.id);
                          }}
                          className="p-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </Button>

                        {/* Dropdown Menu */}
                        {menuOpen === classroom.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10" onClick={(e) => e.stopPropagation()}>
                            <div className="py-1">
                              <Link
                                href={`/dashboard/teacher/classrooms/${classroom.id}/edit`}
                                onClick={() => setMenuOpen(null)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Classroom
                              </Link>
                              <button
                                onClick={() => {
                                  handleDeleteClassroom(classroom);
                                  setMenuOpen(null);
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && classrooms && classrooms.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No classrooms</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first classroom.</p>
            <div className="mt-6">
              <Link href="/dashboard/teacher/classrooms/create">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Classroom
                </Button>
              </Link>
            </div>
          </div>
        )}


        {/* Delete Confirmation Dialog */}
        <Dialog
          isOpen={!!deletingClassroom}
          onClose={cancelDelete}
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
              Are you sure you want to delete <span className="font-medium">&ldquo;{deletingClassroom?.name}&rdquo;</span>?
              This will permanently remove the classroom and all associated data.
            </p>
          </div>

          <DialogActions
            onCancel={cancelDelete}
            onConfirm={confirmDeleteClassroom}
            cancelText="Cancel"
            confirmText="Delete Classroom"
          />
        </Dialog>
      </div>
  );
}
