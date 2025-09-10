"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { trpc } from "../../../../../_trpc/client";
import { Dialog, DialogActions } from "@repo/ui/dialog";
import { toast } from "sonner";

export default function AttachStudentsPage() {
	const params = useParams();
	const router = useRouter();
	const classroomId = params.id as string;

	const [selected, setSelected] = useState<string[]>([]);
	const [studentToRemove, setStudentToRemove] = useState<{ id: string; name: string | null; email: string } | null>(null);

	const { data: classroom, refetch: refetchClassroom } = trpc.getClassroom.useQuery({ id: classroomId }, { enabled: !!classroomId });
	const { data: students, isLoading, error, refetch: refetchAvailable } = trpc.getAvailableStudents.useQuery({ classroomId }, { enabled: !!classroomId });
	const attachMutation = trpc.attachStudentToClassroom.useMutation();
	const detachMutation = trpc.detachStudentFromClassroom.useMutation();

	const toggle = (id: string) => {
		setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
	};

	const attach = async () => {
		if (selected.length === 0) return;
		await Promise.all(selected.map((studentId) => attachMutation.mutateAsync({ classroomId, studentId })));
		router.push(`/dashboard/teacher/classrooms/${classroomId}`);
	};

	const confirmRemove = async () => {
		if (!studentToRemove) return;
		try {
			await detachMutation.mutateAsync({ classroomId, studentId: studentToRemove.id });
			toast.success("Student removed from classroom");
			setStudentToRemove(null);
			await Promise.all([refetchClassroom(), refetchAvailable()]);
		} catch (e) {
			console.error(e);
			toast.error("Failed to remove student. Please try again.");
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Attach Students</h1>
					<p className="text-gray-600 mt-1">Add your students to {classroom?.name || 'this classroom'}.</p>
				</div>
				<Link href={`/dashboard/teacher/classrooms/${classroomId}`}>
					<Button variant="outline">Back</Button>
				</Link>
			</div>

			{/* Enrolled Students */}
			<div className="bg-white border border-gray-200 rounded-lg">
				<div className="p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-2">Currently Enrolled</h2>
					<p className="text-sm text-gray-600 mb-4">Students currently enrolled in this classroom. You can remove them here.</p>
					{classroom?.enrollments && classroom.enrollments.length > 0 ? (
						<div className="space-y-3">
							{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
							{classroom.enrollments.map((enrollment: any) => (
								<div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<div className="flex items-center gap-3 min-w-0">
										<div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
											<span className="text-sm font-medium text-indigo-700">
												{enrollment.student.name?.charAt(0)?.toUpperCase() || enrollment.student.email.charAt(0).toUpperCase()}
											</span>
										</div>
										<div className="min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">{enrollment.student.name || 'Unnamed Student'}</p>
											<p className="text-xs text-gray-500 truncate">{enrollment.student.email}</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<span className="text-xs text-gray-500 hidden sm:inline">{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
										<Button
											variant="ghost"
											size="sm"
											className="text-red-600 hover:text-red-700 hover:bg-red-50"
											onClick={() => setStudentToRemove({ id: enrollment.student.id, name: enrollment.student.name, email: enrollment.student.email })}
										>
											Remove
										</Button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-sm text-gray-600">No students enrolled yet.</div>
					)}
				</div>
			</div>

			{/* Available Students */}
			<div className="bg-white border border-gray-200 rounded-lg">
				<div className="p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-2">Available Students</h2>
					<p className="text-sm text-gray-600 mb-4">These students are under you and not yet enrolled in this classroom.</p>

					{isLoading ? (
						<div className="space-y-2">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="h-12 bg-gray-100 rounded" />
							))}
						</div>
					) : error ? (
						<div className="text-sm text-red-600">{error.message}</div>
					) : (students && students.length > 0 ? (
						<div className="space-y-3">
							{students.map((s) => (
								<label key={s.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${selected.includes(s.id) ? 'bg-indigo-50 border-indigo-300' : 'hover:bg-gray-50 border-gray-200'}`}>
									<input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} className="w-4 h-4" />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{s.name || 'Unnamed Student'}</p>
										<p className="text-xs text-gray-600 truncate">{s.email}</p>
									</div>
								</label>
							))}
						</div>
					) : (
						<div className="text-sm text-gray-600">No available students to attach.</div>
					))}
				</div>

				<div className="border-t p-4 flex items-center justify-between bg-gray-50 rounded-b-lg">
					<p className="text-sm text-gray-600">{selected.length} selected</p>
					<Button onClick={attach} disabled={selected.length === 0 || attachMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
						{attachMutation.isPending ? 'Attaching...' : 'Attach Students'}
					</Button>
				</div>
			</div>

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
						Are you sure you want to remove{' '}
						<span className="font-medium">{studentToRemove?.name || studentToRemove?.email}</span>{' '}
						from this classroom?
					</p>
				</div>

				<DialogActions
					onCancel={() => setStudentToRemove(null)}
					onConfirm={confirmRemove}
					cancelText="Cancel"
					confirmText={detachMutation.isPending ? 'Removing...' : 'Remove Student'}
					isLoading={detachMutation.isPending}
				/>
			</Dialog>
		</div>
	);
}
