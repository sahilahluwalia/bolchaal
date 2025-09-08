import React, { useState } from "react";

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  color: string;
}

const demoAccounts: DemoAccount[] = [
  {
    role: "Teacher",
    email: "teacher@demo.com",
    password: "demo123",
    color: "indigo"
  },
  {
    role: "Student",
    email: "student@demo.com",
    password: "demo123",
    color: "emerald"
  }
];

export function DemoAccountBox() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

