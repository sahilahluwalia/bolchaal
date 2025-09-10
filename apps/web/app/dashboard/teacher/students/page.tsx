'use client'
import Link from "next/link";
import { trpc } from "../../../_trpc/client";
import { Button } from "@repo/ui/button";

type TeacherStudent = {
	id: string;
	name: string | null;
	email: string;
	classrooms: { id: string; name: string }[];
	enrollmentDate: string | Date | null;
};

export default function TeacherStudentsPage() {
	const { data: students, isLoading, error, refetch } = trpc.getTeacherStudents.useQuery();

	const totalStudents = students?.length ?? 0;
	const activeStudents = totalStudents; // Placeholder: no activity status yet

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load students</h3>
				<p className="mt-1 text-sm text-gray-500">{error.message}</p>
				<div className="mt-6">
					<Button onClick={() => refetch()}>Retry</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Students</h1>
					<p className="text-gray-600">Manage your students and their classroom assignments</p>
				</div>
				<div className="flex gap-3">
					<Link href="/dashboard/teacher/students/invite">
						<Button className="bg-indigo-600 hover:bg-indigo-700">
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
							</svg>
							Add Student
						</Button>
					</Link>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
								<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
								</svg>
							</div>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Total Students</p>
							<p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
								<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Active Students</p>
							<p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
								<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Recent Activity</p>
							<p className="text-2xl font-bold text-gray-900">—</p>
						</div>
					</div>
				</div>
			</div>

			{/* Students List */}
			<div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
					<h2 className="text-lg font-semibold text-gray-900">Student List</h2>
					<div className="flex items-center gap-2 w-full sm:w-auto">
						<div className="relative flex-1 sm:flex-initial">
							<input
								type="text"
								placeholder="Search students..."
								className="w-full sm:w-64 px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							/>
							<svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
					</div>
				</div>

				{/* Desktop Table */}
				<div className="hidden lg:block overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Student
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Classrooms
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{(students ?? []).map((student: TeacherStudent) => (
								<tr key={student.id} className="hover:bg-gray-50">
									<td className="px-4 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
												<span className="text-sm font-medium text-gray-700">
													{(student.name || student.email).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
												</span>
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-900">{student.name || "Unnamed Student"}</div>
												<div className="text-sm text-gray-500">{student.email}</div>
											</div>
										</div>
									</td>
									<td className="px-4 py-4">
										<div className="flex flex-wrap gap-1">
											{student.classrooms.map((c: { id: string; name: string }) => (
												<span key={c.id} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
													{c.name}
												</span>
											))}
										</div>
									</td>
									<td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
										<Link href={`/dashboard/teacher/students/${student.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
											View Profile
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Mobile Card View */}
				<div className="lg:hidden space-y-4">
					{(students ?? []).map((student: TeacherStudent) => (
						<div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center flex-1 min-w-0">
									<div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
										<span className="text-sm font-medium text-gray-700">
											{(student.name || student.email).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
										</span>
									</div>
									<div className="ml-3 flex-1 min-w-0">
										<div className="text-sm font-medium text-gray-900 truncate">{student.name || "Unnamed Student"}</div>
										<div className="text-sm text-gray-500 truncate">{student.email}</div>
									</div>
								</div>
								<Link href={`/dashboard/teacher/students/${student.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium whitespace-nowrap ml-2">
									View
								</Link>
							</div>

							<div className="space-y-3">
								<div>
									<div className="text-xs text-gray-500 mb-1">Classrooms</div>
									<div className="flex flex-wrap gap-1">
										{student.classrooms.map((c: { id: string; name: string }) => (
											<span key={c.id} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
												{c.name}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
