"use client";

import { useState } from "react";
export default function TeacherMessagesPage() {
  const [selectedClassroom, setSelectedClassroom] = useState("all");
  const [newMessage, setNewMessage] = useState("");

  // Mock data - in a real app, this would come from your API
  const classrooms = [
    { id: "all", name: "All Classrooms" },
    { id: "math101", name: "Mathematics 101" },
    { id: "physics", name: "Physics Lab" },
    { id: "chemistry", name: "Chemistry Basics" },
  ];

  const messages = [
    {
      id: "1",
      content: "Great work on the homework assignment! I'm impressed with your problem-solving skills.",
      sender: "Alice Johnson",
      classroom: "Mathematics 101",
      timestamp: "2024-01-22 14:30",
      type: "text",
      isBot: false,
    },
    {
      id: "2",
      content: "Please remember to submit your lab reports by Friday. Include all calculations and observations.",
      sender: "Teacher (You)",
      classroom: "Physics Lab",
      timestamp: "2024-01-22 10:15",
      type: "text",
      isBot: false,
    },
    {
      id: "3",
      content: "Can someone explain the concept of chemical equilibrium?",
      sender: "Bob Smith",
      classroom: "Chemistry Basics",
      timestamp: "2024-01-22 09:45",
      type: "text",
      isBot: false,
    },
    {
      id: "4",
      content: "Welcome to the class! Please introduce yourself in the discussion forum.",
      sender: "Teacher (You)",
      classroom: "Mathematics 101",
      timestamp: "2024-01-20 08:00",
      type: "text",
      isBot: false,
    },
  ];

  const filteredMessages = selectedClassroom === "all"
    ? messages
    : messages.filter(msg => {
        if (selectedClassroom === "math101") return msg.classroom === "Mathematics 101";
        if (selectedClassroom === "physics") return msg.classroom === "Physics Lab";
        if (selectedClassroom === "chemistry") return msg.classroom === "Chemistry Basics";
        return true;
      });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the API
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Communicate with your students and manage classroom discussions</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Message
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Messages List */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              {/* Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 hidden sm:inline">Filter by:</label>
                  <select
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 p-3 md:p-4 rounded-lg ${
                      message.sender === "Teacher (You)"
                        ? "bg-indigo-50 ml-4 md:ml-8"
                        : "bg-gray-50 mr-4 md:mr-8"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {message.sender === "Teacher (You)" ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <span className="text-xs md:text-sm font-medium text-gray-700">
                            {message.sender.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{message.classroom}</span>
                          <span>•</span>
                          <span>{message.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 break-words">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMessages.length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                  <p className="mt-1 text-sm text-gray-500">Messages from your students will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-4 md:space-y-6 order-1 xl:order-2">
            {/* Quick Send */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Message</h3>
              <div className="space-y-4">
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>Select classroom...</option>
                  {classrooms.slice(1).map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>

            {/* Message Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-full">
                    {messages.length}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Sent Today</span>
                  <span className="text-sm font-medium text-white bg-blue-600 px-2 py-1 rounded-full">
                    2
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Active Conversations</span>
                  <span className="text-sm font-medium text-white bg-green-600 px-2 py-1 rounded-full">
                    3
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Unread Messages</span>
                  <span className="text-sm font-medium text-white bg-orange-600 px-2 py-1 rounded-full">
                    0
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200 hover:border-gray-300">
                  📢 Send Announcement
                </button>
                <button className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200 hover:border-gray-300">
                  📝 Assignment Reminder
                </button>
                <button className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200 hover:border-gray-300">
                  📊 Grade Update
                </button>
                <button className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-gray-200 hover:border-gray-300">
                  🎯 Motivational Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
