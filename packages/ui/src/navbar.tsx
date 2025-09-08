"use client";

import { useState } from "react";

interface NavbarProps {
  onNavigate?: (path: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback to simple navigation for demo purposes
      if (path.startsWith('#')) {
        const element = document.querySelector(path);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.location.href = path;
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">BolChaal</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:flex-1 md:justify-end">
            <div className="flex items-center space-x-1 lg:space-x-8">
              <button
                onClick={() => handleNavigation('#features')}
                className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation('#how-it-works')}
                className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
              >
                How it works
              </button>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button
                  onClick={() => handleNavigation('/auth/sign-in')}
                  className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Sign in
                </button>
                <button
                  onClick={() => handleNavigation('/auth/sign-up')}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 lg:px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors whitespace-nowrap"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <button
              onClick={() => handleNavigation('#features')}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Features
            </button>
            <button
              onClick={() => handleNavigation('#how-it-works')}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              How it works
            </button>
            <button
              onClick={() => handleNavigation('/auth/sign-in')}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Sign in
            </button>
            <div className="px-3 py-2">
              <button
                onClick={() => handleNavigation('/auth/sign-up')}
                className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
