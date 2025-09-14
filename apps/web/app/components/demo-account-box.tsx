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
    email: "sahil+teacher@gmail.com",
    password: "sahil+teacher@gmail.com",
    color: "indigo"
  },
  {
    role: "Student",
    email: "sahil+student@gmail.com",
    password: "sahil+student@gmail.com",
    color: "emerald"
  }
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
      console.error('Failed to copy text: ', err);
    }
  };


  const signInMutation = trpc.signIn.useMutation();

  const handleLogin = async (email: string, password: string, role: string) => {
    console.log('Demo login clicked:', { email, password, role });
    setIsLoggingIn(role);
    setError(null);

    try {
             // Make API call directly
       const { accessToken, role } = await signInMutation.mutateAsync({
        email: email.trim(),
        password: password,
      });

      TokenManager.setAccessToken(accessToken);
      if(role === 'TEACHER'){
        router.push('/dashboard/teacher');
      }else{
        router.push('/dashboard/student');
      }
    } catch (error) {
      console.log(error);
      if (error instanceof TRPCClientError) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoggingIn(null);
    }
  };

  return (
    <div className="ui:bg-white ui:rounded-xl ui:shadow-xl ui:p-6 ui:border ui:border-gray-200">
      <div className="ui:flex ui:items-center ui:gap-3 ui:mb-4">
        <div className="ui:flex ui:items-center ui:justify-center ui:w-10 ui:h-10 ui:bg-indigo-100 ui:rounded-full">
          <svg className="ui:w-5 ui:h-5 ui:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="ui:text-lg ui:font-bold ui:text-gray-900">Demo Accounts</h3>
          <p className="ui:text-sm ui:text-gray-600">Try these to explore the platform</p>
        </div>
      </div>

      {error && (
        <div className="ui:mb-4 ui:bg-red-50 ui:border ui:border-red-200 ui:text-red-700 ui:px-4 ui:py-3 ui:rounded-md ui:text-sm">
          {error}
        </div>
      )}

      <div className="ui:space-y-4">
        {demoAccounts.map((account, index) => (
          <div key={account.role} className="ui:bg-gradient-to-r ui:from-gray-50 ui:to-gray-100 ui:p-4 ui:rounded-lg ui:border ui:border-gray-200 ui:shadow-sm ui:hover:shadow-md ui:transition-shadow">
            <div className="ui:flex ui:items-center ui:justify-between ui:mb-3">
              <span className={`ui:inline-flex ui:items-center ui:px-3 ui:py-1 ui:rounded-full ui:text-sm ui:font-semibold ui:bg-${account.color}-100 ui:text-${account.color}-800 ui:shadow-sm`}>
                <svg className="ui:w-4 ui:h-4 ui:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {account.role}
              </span>
            </div>

            <div className="ui:space-y-3">
              <div>
                <label className="ui:block ui:text-xs ui:font-medium ui:text-gray-500 ui:mb-1">Email</label>
                <div className="ui:flex ui:items-center ui:gap-2">
                  <code className="ui:flex-1 ui:bg-white ui:px-3 ui:py-2 ui:text-sm ui:font-mono ui:text-gray-800 ui:rounded ui:border ui:border-gray-300 ui:shadow-inner">
                    {account.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(account.email, index * 2)}
                    className="ui:p-2 ui:bg-indigo-600 ui:text-white ui:rounded ui:hover:bg-indigo-700 ui:transition-colors ui:shadow-sm"
                    title="Copy email"
                  >
                    <svg className="ui:w-4 ui:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                {copiedIndex === index * 2 && (
                  <div className="ui:mt-1 ui:text-xs ui:text-green-600 ui:flex ui:items-center ui:gap-1">
                    <svg className="ui:w-3 ui:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </div>
                )}
              </div>

              <div>
                <label className="ui:block ui:text-xs ui:font-medium ui:text-gray-500 ui:mb-1">Password</label>
                <div className="ui:flex ui:items-center ui:gap-2">
                  <code className="ui:flex-1 ui:bg-white ui:px-3 ui:py-2 ui:text-sm ui:font-mono ui:text-gray-800 ui:rounded ui:border ui:border-gray-300 ui:shadow-inner">
                    {account.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(account.password, index * 2 + 1)}
                    className="ui:p-2 ui:bg-indigo-600 ui:text-white ui:rounded ui:hover:bg-indigo-700 ui:transition-colors ui:shadow-sm"
                    title="Copy password"
                  >
                    <svg className="ui:w-4 ui:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                {copiedIndex === index * 2 + 1 && (
                  <div className="ui:mt-1 ui:text-xs ui:text-green-600 ui:flex ui:items-center ui:gap-1">
                    <svg className="ui:w-3 ui:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </div>
                )}
              </div>

              {/* Login Button */}
              <div className="ui:pt-2 ui:border-t ui:border-gray-200">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked!', account.role);
                    handleLogin(account.email, account.password, account.role);
                  }}
                  disabled={isLoggingIn === account.role}
                  type="button"
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: account.color === 'indigo' ? '#4f46e5' : '#059669',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: isLoggingIn === account.role ? 0.5 : 1,
                    pointerEvents: isLoggingIn === account.role ? 'none' : 'auto'
                  }}
                >
                  {isLoggingIn === account.role ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Logging in...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login as {account.role}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions
      <div className="ui:mt-6 ui:p-4 ui:bg-blue-50 ui:rounded-lg ui:border ui:border-blue-200">
        <div className="ui:flex ui:items-start ui:gap-3">
          <div className="ui:flex-shrink-0">
            <svg className="ui:w-5 ui:h-5 ui:text-blue-600 ui:mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="ui:text-sm ui:font-semibold ui:text-blue-900 ui:mb-1">Two Ways to Try Demo</h4>
            <ul className="ui:text-xs ui:text-blue-800 ui:space-y-1">
              <li className="ui:flex ui:items-center ui:gap-2">
                <span className="ui:w-1 ui:h-1 ui:bg-blue-600 ui:rounded-full"></span>
                <strong>Quick Login:</strong> Click the login button above
              </li>
              <li className="ui:flex ui:items-center ui:gap-2">
                <span className="ui:w-1 ui:h-1 ui:bg-blue-600 ui:rounded-full"></span>
                <strong>Manual Entry:</strong> Copy credentials and paste in the form
              </li>
            </ul>
          </div>
        </div>
      </div> */}
    </div>
  );
}

