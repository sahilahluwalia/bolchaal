import React from "react";

export function AuthFooter() {
  return (
    <div className="ui:mt-8 ui:pt-6 ui:border-t ui:border-gray-200 ui:flex ui:items-center ui:justify-between">
      <a href="/" className="ui:text-sm ui:text-gray-600 hover:ui:text-gray-900 ui:flex ui:items-center ui:gap-2">
        <svg className="ui:w-4 ui:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to homepage
      </a>
      <div className="ui:text-lg ui:font-bold ui:text-indigo-600">BolChaal</div>
    </div>
  );
}

