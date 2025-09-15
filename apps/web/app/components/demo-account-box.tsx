import { TRPCClientError } from "@trpc/client";
import React, { useState } from "react";
import { trpc } from "../_trpc/client";
import { TokenManager } from "../../utils/auth";
import { useRouter } from "next/navigation";
interface DemoAccount {
  role: string;
  email: string;
  password: string;
  color: string;
}

const demoAccounts: DemoAccount[] = [
  {
    role: "Teacher",
    email: "teacher@teacher.com",
    password: "teacher@teacher.com",
    color: "indigo",
  },
  {
    role: "Student",
    email: "student@student.com",
    password: "student@student.com",
    color: "emerald",
  },
];

export function DemoAccountBox() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const signInMutation = trpc.signIn.useMutation();

  const handleLogin = async (email: string, password: string, role: string) => {
    console.log("Demo login clicked:", { email, password, role });
    setIsLoggingIn(role);
    setError(null);

    try {
      // Make API call directly
      const { accessToken, role } = await signInMutation.mutateAsync({
        email: email.trim(),
        password: password,
      });

      TokenManager.setAccessToken(accessToken);
      if (role === "TEACHER") {
        router.push("/dashboard/teacher");
      } else {
        router.push("/dashboard/student");
      }
    } catch (error) {
      console.log(error);
      if (error instanceof TRPCClientError) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoggingIn(null);
    }
  };

  const getRoleBadgeClasses = (color: string) => {
    if (color === "indigo") {
      return "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 shadow-sm";
    }
    return "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 shadow-sm";
  };

  const getButtonClasses = (color: string, isDisabled: boolean) => {
    const baseClasses = "w-full px-3 py-1.5 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
    
    if (isDisabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed`;
    }
    
    if (color === "indigo") {
      return `${baseClasses} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md`;
    }
    return `${baseClasses} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm hover:shadow-md`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 border border-gray-200 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full">
          <svg
            className="w-3 h-3 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Demo Accounts
          </h3>
          <p className="text-xs text-gray-600">
            Try these to explore
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {demoAccounts.map((account, index) => (
          <div
            key={account.role}
            className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={getRoleBadgeClasses(account.color)}>
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {account.role}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center gap-1">
                  <code className="flex-1 bg-white px-2 py-1 text-xs font-mono text-gray-800 rounded border border-gray-300 shadow-inner break-all">
                    {account.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(account.email, index * 2)}
                    className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors shadow-sm flex-shrink-0"
                    title="Copy email"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
                {copiedIndex === index * 2 && (
                  <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="flex items-center gap-1">
                  <code className="flex-1 bg-white px-2 py-1 text-xs font-mono text-gray-800 rounded border border-gray-300 shadow-inner break-all">
                    {account.password}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(account.password, index * 2 + 1)
                    }
                    className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors shadow-sm flex-shrink-0"
                    title="Copy password"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
                {copiedIndex === index * 2 + 1 && (
                  <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </div>
                )}
              </div>

              {/* Login Button */}
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Button clicked!", account.role);
                    handleLogin(account.email, account.password, account.role);
                  }}
                  disabled={isLoggingIn === account.role}
                  type="button"
                  className={getButtonClasses(account.color, isLoggingIn === account.role)}
                >
                  {isLoggingIn === account.role ? (
                    <>
                      <svg
                        className="w-3 h-3 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span className="text-xs">Logging in...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="text-xs">Login as {account.role}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
