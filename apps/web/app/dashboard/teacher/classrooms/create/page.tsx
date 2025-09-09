"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { InputField } from "@repo/ui/input-field";
import { trpc } from "../../../../_trpc/client";
import { toast } from "sonner";

export default function CreateClassroomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createClassroomMutation = trpc.createClassroom.useMutation({
    onSuccess: (data) => {
      toast.success("Classroom created successfully!");
      router.push(`/dashboard/teacher/classrooms/${data.id}`);
    },
    onError: (error) => {
      if (error.message.includes("name")) {
        setErrors({ name: error.message });
      } else {
        setErrors({ general: error.message });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: "Classroom name is required" });
      return;
    }

    createClassroomMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Classroom</h1>
          <p className="text-gray-600 mt-1">
            Create a new classroom space for your students
          </p>
        </div>
        <Link href="/dashboard/teacher/classrooms">
          <Button variant="outline">Cancel</Button>
        </Link>
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
            placeholder="Enter classroom name (e.g., English 101, Advanced Math)"
            required
            error={errors.name}
            disabled={createClassroomMutation.isPending}
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
              placeholder="Enter a description for this classroom (e.g., Introduction to algebra and geometry concepts)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              disabled={createClassroomMutation.isPending}
            />
            <p className="mt-1 text-sm text-gray-500">
              Describe what students will learn in this classroom
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createClassroomMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {createClassroomMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Classroom...
                </div>
              ) : (
                "Create Classroom"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>After creating your classroom, you can:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Add lessons to make them available to students</li>
                <li>Invite students to join the classroom</li>
                <li>Monitor student progress and chat sessions</li>
                <li>View detailed analytics and reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
