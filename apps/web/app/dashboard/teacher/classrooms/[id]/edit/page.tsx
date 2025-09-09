"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { InputField } from "@repo/ui/input-field";
import { trpc } from "../../../../../_trpc/client";
import { toast } from "sonner";

export default function EditClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: classroom, isLoading } = trpc.getClassroom.useQuery(
    { id: classroomId },
    { enabled: !!classroomId }
  );

  const updateClassroomMutation = trpc.updateClassroom.useMutation({
    onSuccess: () => {
      toast.success("Classroom updated successfully!");
      router.back();
    },
    onError: (error) => {
      if (error.message.includes("name")) {
        setErrors({ name: error.message });
      } else {
        setErrors({ general: error.message });
      }
    },
  });

  useEffect(() => {
    if (classroom) {
      setFormData({
        name: classroom.name,
        description: classroom.description || "",
      });
    }
  }, [classroom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: "Classroom name is required" });
      return;
    }

    updateClassroomMutation.mutate({
      id: classroomId,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Classroom Not Found</h2>
          <p className="text-gray-600 mb-4">The classroom you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Classroom</h1>
          <p className="text-gray-600 mt-1">
            Update details for <span className="font-medium">"{classroom.name}"</span>
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <InputField
            id="name"
            name="name"
            label="Classroom Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter classroom name"
            required
            error={errors.name}
            disabled={updateClassroomMutation.isPending}
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter classroom description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              disabled={updateClassroomMutation.isPending}
            />
            <p className="mt-1 text-sm text-gray-500">
              Describe what students will learn in this classroom
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={updateClassroomMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {updateClassroomMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Classroom...
                </div>
              ) : (
                "Update Classroom"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Classroom Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Classroom Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p><strong>Students:</strong> {classroom.studentCount}</p>
              <p><strong>Chat Sessions:</strong> {classroom.chatSessionCount}</p>
              <p><strong>Messages:</strong> {classroom.messageCount}</p>
              <p><strong>Created:</strong> {new Date(classroom.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
