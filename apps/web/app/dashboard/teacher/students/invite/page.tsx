"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trpc } from "../../../../_trpc/client";
import { Button } from "@repo/ui/button";
import QRCode from "react-qr-code";
import { toast } from "sonner";

export default function InviteStudentPage() {
	const search = useSearchParams();
	const classroomId = search.get("classroomId") || undefined;

	const [isCreating, setIsCreating] = useState(false);
	const [expiresIn, setExpiresIn] = useState<number>(24 * 7); // hours

	const createInvite = trpc.createStudentInvite.useMutation();

	const [token, setToken] = useState<string | null>(null);
	const [expiresAt, setExpiresAt] = useState<Date | null>(null);

	const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
	const inviteUrl = useMemo(() => {
		if (!token) return "";
		return `${baseUrl}/auth/student/sign-up/${token}`;
	}, [token, baseUrl]);

	const handleCreate = async () => {
		setIsCreating(true);
		try {
			const res = await createInvite.mutateAsync({
				classroomId,
				expiresInHours: expiresIn,
			});
			setToken(res.token);
			setExpiresAt(res.expiresAt);
		} catch (e) {
			console.error(e);
		} finally {
			setIsCreating(false);
		}
	};

	// Auto-generate invite on first load if none exists yet
	useEffect(() => {
		if (!token && !isCreating && !createInvite.isPending) {
			(void (async () => {
				setIsCreating(true);
				try {
					const res = await createInvite.mutateAsync({ classroomId, expiresInHours: expiresIn });
					setToken(res.token);
					setExpiresAt(res.expiresAt);
				} catch (e) {
					console.error(e);
				} finally {
					setIsCreating(false);
				}
			})());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, classroomId, expiresIn]);

	const handleCopy = async () => {
		if (!inviteUrl) return;
		await navigator.clipboard.writeText(inviteUrl);
		toast.success("Link copied to clipboard");
	};

	const handleWhatsapp = () => {
		if (!inviteUrl) return;
		const text = encodeURIComponent(
			`Join my class on BolChaal. Sign up here: ${inviteUrl}`
		);
		window.open(`https://wa.me/?text=${text}`, "_blank");
	};

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Add Student</h1>
					<p className="text-gray-600 mt-1">Create an invite link for a student to sign up under you.</p>
				</div>
				<Link href="/dashboard/teacher/students">
					<Button variant="outline">Back to Students</Button>
				</Link>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
						<select
							value={expiresIn}
							onChange={(e) => setExpiresIn(Number(e.target.value))}
							className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							<option value={24}>24 hours</option>
							<option value={24 * 3}>3 days</option>
							<option value={24 * 7}>7 days</option>
							<option value={24 * 14}>14 days</option>
							<option value={24 * 30}>30 days</option>
						</select>
						<p className="text-xs text-gray-500 mt-1">Choose how long this link should remain valid.</p>
					</div>
				</div>

				<div className="flex flex-wrap gap-3">
					<Button onClick={handleCreate} disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700">
						{isCreating ? "Creating..." : "Generate Invite"}
					</Button>
					<Button variant="outline" onClick={handleCopy} disabled={!token}>Copy Link</Button>
					<Button variant="outline" onClick={handleWhatsapp} disabled={!token}>Share on WhatsApp</Button>
				</div>

				{token && (
					<div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
						<div className="space-y-3">
							<label className="block text-sm font-medium text-gray-700">Invite Link</label>
							<div className="p-3 border rounded-md bg-gray-50 break-all text-sm">
								{inviteUrl}
							</div>
							{expiresAt && (
								<p className="text-xs text-gray-500">Expires on {new Date(expiresAt).toLocaleString()}</p>
							)}
						</div>
						<div className="flex items-center justify-center p-4 bg-white">
							<div className="bg-white p-4 rounded-lg border">
								<QRCode value={inviteUrl} size={192} />
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
				<p className="text-sm text-indigo-900">
					Share the link or QR code with your student. They will be taken to a dedicated signup page with your teacher info.
				</p>
			</div>
		</div>
	);
}
