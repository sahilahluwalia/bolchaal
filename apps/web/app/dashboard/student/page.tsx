"use client";

export default function StudentDashboardPage() {
  // Mock data for dashboard
  const upcomingAssignments = [
    { id: 1, title: "Math Assignment 3", subject: "Mathematics 101", dueDate: "2024-01-25", status: "pending" },
    { id: 2, title: "Physics Lab Report", subject: "Physics Lab", dueDate: "2024-01-27", status: "pending" },
    { id: 3, title: "Chemistry Quiz", subject: "Chemistry Basics", dueDate: "2024-01-23", status: "submitted" },
  ];

  const recentAnnouncements = [
    { id: 1, title: "Mid-term Schedule Update", subject: "Mathematics 101", date: "2024-01-22", content: "Mid-term exams will start from February 1st..." },
    { id: 2, title: "Lab Safety Reminder", subject: "Physics Lab", date: "2024-01-21", content: "Please ensure all safety protocols are followed..." },
    { id: 3, title: "New Study Materials", subject: "Chemistry Basics", date: "2024-01-20", content: "Additional study materials have been uploaded..." },
  ];

  const classProgress = [
    { id: 1, name: "Mathematics 101", progress: 75, grade: "A-" },
    { id: 2, name: "Physics Lab", progress: 60, grade: "B+" },
    { id: 3, name: "Chemistry Basics", progress: 85, grade: "A" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your learning overview.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/student/chats"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Open Chats
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Classes Joined</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread Messages</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall GPA</p>
              <p className="text-2xl font-bold text-gray-900">3.7</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Upcoming Assignments */}
        <div className="xl:col-span-2 order-2 xl:order-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">{assignment.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {assignment.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assignment.status === 'submitted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.status === 'submitted' ? 'Submitted' : 'Pending'}
                    </span>
                    <button className="text-indigo-600 hover:text-indigo-800">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Class Progress & Announcements */}
        <div className="space-y-4 md:space-y-6 order-1 xl:order-2">
          {/* Class Progress */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Progress</h3>
            <div className="space-y-4">
              {classProgress.map((classroom) => (
                <div key={classroom.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{classroom.name}</span>
                    <span className="text-sm font-bold text-gray-900">{classroom.grade}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${classroom.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{classroom.progress}% Complete</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h3>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="text-sm font-medium text-gray-900">{announcement.title}</h4>
                  <p className="text-xs text-gray-600 mb-1">{announcement.subject}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
