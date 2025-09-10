"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "../../utils/cn";
import { TokenManager } from "../../utils/auth";
import { useUserProfile } from "../../utils/hooks";
import { trpc } from "../_trpc/client";

interface StudentSidebarProps {
  className?: string;
}

export function StudentSidebar({ className }: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: userProfile, isLoading } = useUserProfile();

  const handleLogout = async () => {
    try {
      await TokenManager.logout();
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout API fails
      router.push('/auth/sign-in');
    }
  };

  // Load real classrooms the student joined
  const { data: myClassrooms, isLoading: loadingClasses } = trpc.getMyClassrooms.useQuery();
  type MyClassroom = { id: string; name: string; teacherName?: string | null };
  const classesJoined = ((myClassrooms || []) as MyClassroom[]).map((c) => ({
    id: c.id,
    name: c.name,
    teacher: c.teacherName || "Teacher",
    unreadCount: 0,
  }));

  // Chats list removed; class list acts as entry to lesson chats

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard/student",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      ),
      section: "dashboard" as const,
    },
    {
      name: "Chats",
      href: "/dashboard/student/chats",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      section: "chats" as const,
    },
    {
      name: "Settings",
      href: "/dashboard/student/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      section: "settings" as const,
    },
  ];

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 h-full",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          {!isCollapsed && (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
          )}
          <span className={cn("font-semibold text-gray-900", isCollapsed && "hidden")}>
            Student Panel
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg
            className={cn("w-4 h-4 text-gray-500 transition-transform", isCollapsed && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border",
                    isCollapsed ? "justify-center" : "",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                  )}
                >
                  <span className={cn(isActive ? "text-indigo-600" : "text-gray-500")}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Classes Joined Section */}
        {!isCollapsed && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Classes Joined</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {loadingClasses ? 0 : classesJoined.length}
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {loadingClasses ? (
                <div className="text-xs text-gray-500 px-2 py-1">Loading...</div>
              ) : classesJoined.length === 0 ? (
                <div className="text-xs text-gray-500 px-2 py-1">No classes yet</div>
              ) : (
                classesJoined.map((classroom) => (
                  <Link
                    key={classroom.id}
                    href={`/dashboard/student/chats/class/${classroom.id}`}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {classroom.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {classroom.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {classroom.teacher}
                      </p>
                    </div>
                    {classroom.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {classroom.unreadCount}
                      </span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chats Section removed (use class list instead) */}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {isLoading ? "Loading..." : (userProfile?.name || "Student")}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isLoading ? "Loading..." : (userProfile?.email || "student@school.edu")}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
