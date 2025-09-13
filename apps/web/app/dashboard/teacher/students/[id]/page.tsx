'use client'
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "../../../../_trpc/client";
import { Button } from "@repo/ui/button";
import { StatCard } from "@repo/ui/stat-card";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: studentProfile, isLoading: profileLoading, error: profileError } = 
    trpc.getStudentProfile.useQuery({ studentId });
  
  const { data: chatSessions, isLoading: sessionsLoading, error: sessionsError } = 
    trpc.getStudentChatSessions.useQuery({ studentId });

  if (profileLoading || sessionsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (profileError || sessionsError) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load student profile</h3>
        <p className="mt-1 text-sm text-gray-500">
          {profileError?.message || sessionsError?.message}
        </p>
        <div className="mt-6">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-medium text-gray-900">Student not found</h3>
        <div className="mt-6">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {studentProfile.name || "Unnamed Student"}
            </h1>
            <p className="text-gray-600">{studentProfile.email}</p>
          </div>
        </div>
      </div>

      {/* Student Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          label="Total Messages"
          value={chatSessions?.reduce((sum, group) => sum + group.totalMessages, 0) || 0}
          bgColorClassName="ui:bg-blue-100"
        />

        <StatCard
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          label="Chat Sessions"
          value={chatSessions?.reduce((sum, group) => sum + group.totalSessions, 0) || 0}
          bgColorClassName="ui:bg-green-100"
        />

        <StatCard
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          label="Lessons Completed"
          value={chatSessions?.filter(group => group.lesson).length || 0}
          bgColorClassName="ui:bg-purple-100"
        />

        <StatCard
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Active Chat Sessions"
          value={chatSessions?.filter(group => group.latestSession.status === 'ACTIVE').length || 0}
          bgColorClassName="ui:bg-orange-100"
        />
      </div>

      {/* Student Insights & Concerns */}
      <div className="space-y-4">
        {/* Alert Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">AI-Generated Insights</h3>
              <p className="text-sm text-blue-700 mt-1">
                Student insights and concerns are automatically generated by analyzing chat patterns and behavior. 
                These can be updated via background cron jobs or manually refreshed by teachers.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase mb-4">INSIGHTS</h2>
              <div className="mb-3">
                <p className="text-xs text-gray-500 italic">* Below content is dummy data for demonstration purposes</p>
              </div>
              <div className="max-h-80 overflow-y-auto pr-2">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2 mt-1">•</span>
                    <span>
                      <strong>Consistent engagement:</strong> Student shows regular participation in chat sessions with an average of 12 messages per session. Demonstrates good responsiveness to lesson prompts and maintains active conversation flow.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2 mt-1">•</span>
                    <span>
                      <strong>Vocabulary improvement:</strong> Student has shown steady progress in vocabulary usage over the past sessions. Recent messages indicate better understanding of complex sentence structures and grammar rules.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Concerns Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-bold text-red-600 uppercase mb-4">CONCERNS</h2>
              <div className="mb-3">
                <p className="text-xs text-gray-500 italic">* Below content is dummy data for demonstration purposes</p>
              </div>
              <div className="max-h-80 overflow-y-auto pr-2">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2 mt-1">•</span>
                    <span>
                      <strong>Occasional pronunciation challenges:</strong> Student sometimes struggles with pronunciation in audio messages. Consider providing additional pronunciation practice exercises and focusing on phonetic patterns.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2 mt-1">•</span>
                    <span>
                      <strong>Hesitation in advanced topics:</strong> Student shows some hesitation when discussing complex or advanced conversation topics. May benefit from gradual introduction to more challenging material.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sessions by Lesson */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Sessions by Lesson</h2>
        
        {!chatSessions || chatSessions.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No chat sessions found</h3>
            <p className="mt-1 text-sm text-gray-500">This student hasn&apos;t started any chat sessions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classroom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chatSessions.map((group, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {group.classroom.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {group.lesson?.title || "General Chat"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {group.totalSessions}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {group.totalMessages}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(group.latestSession.startedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/dashboard/teacher/students/${studentId}/chat-sessions/${group.latestSession.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Chats
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
