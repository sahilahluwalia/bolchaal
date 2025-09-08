"use client";

import { useState } from "react";
import { ChatInterface } from "../../../components/chat-interface";

export default function StudentChatsPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>("math101");

  // Mock data for chats
  const chats = [
    {
      id: "math101",
      name: "Mathematics Study Group",
      lastMessage: "Hey everyone, need help with...",
      timestamp: "2 min ago",
      unreadCount: 3,
      members: 5
    },
    {
      id: "physics",
      name: "Physics Lab Team",
      lastMessage: "Don't forget the lab report",
      timestamp: "1 hour ago",
      unreadCount: 1,
      members: 4
    },
    {
      id: "chemistry",
      name: "Chemistry Discussion",
      lastMessage: "Great work on the project!",
      timestamp: "3 hours ago",
      unreadCount: 0,
      members: 6
    },
    {
      id: "history",
      name: "History Study Session",
      lastMessage: "Check out these notes I found",
      timestamp: "1 day ago",
      unreadCount: 0,
      members: 8
    }
  ];

  const currentChat = chats.find(chat => chat.id === selectedChat);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex h-full">
        {/* Chat List Sidebar */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
            <p className="text-sm text-gray-600">Connect with your classmates</p>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat === chat.id ? 'bg-indigo-50 border-r-2 border-r-indigo-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {chat.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {chat.name}
                      </h3>
                      <span className="text-xs text-gray-500">{chat.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{chat.members} members</span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 hidden md:block">
          {currentChat ? (
            <ChatInterface
              chatName={currentChat.name}
              chatId={currentChat.id}
              className="h-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat</h3>
                <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Chat Interface Overlay */}
        {selectedChat && (
          <div className="fixed inset-0 md:hidden z-50 bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-900">{currentChat?.name}</h2>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
            <ChatInterface
              chatName={currentChat?.name || ""}
              chatId={currentChat?.id || ""}
              className="h-[calc(100vh-5rem)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
