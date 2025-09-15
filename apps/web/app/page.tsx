"use client";

import Link from "next/link";
import { useRef } from "react";
import { Navbar } from "./components/navbar";

export default function Page() {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // No scrolling needed - all content is visible

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-gray-900 pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 560" aria-hidden>
            <defs>
              <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop stopColor="#6366F1" offset="0%" />
                <stop stopColor="#06B6D4" offset="100%" />
              </linearGradient>
            </defs>
            <rect width="1440" height="560" fill="url(#g)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">Your friendly neighborhood Jinso clone</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                BolChaal, Learn by speaking, guided by your teacher
              </h1>
              <p className="mt-5 max-w-prose text-base sm:text-lg text-gray-600">
                Students practice English through chat and audio with an adaptive bot. Teachers create classrooms and rubrics, and the bot evaluates, coaches, and tracks progress in real time.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-sm font-medium text-emerald-800">
                  📋 Rubric: <span className="font-bold">Fluency, Pronunciation, Vocabulary</span>, Bot will assess each message.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/auth/sign-up" className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Get started free
                </Link>
                <Link href="#how-it-works" className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50">
                  See how it works
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
                <span>•</span>
                <span>No credit card required</span>
                {/* <span>Designed for mobile and desktop</span> */}
              </div>
            </div>
            <div className="lg:pl-8">
              <div className="relative rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="aspect-[5/4] w-full overflow-hidden rounded-xl bg-gray-50">
                  <div className="p-2 sm:p-4">
                    <div className="space-y-4 text-sm h-[42rem] chat-container" ref={chatContainerRef}>
                      <div className="flex items-start gap-3 chat-message opacity-0">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">S</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Student</p>
                          <div className="mt-1 p-3 rounded-lg bg-indigo-50 text-gray-700 message-bubble">
                            Hi! I want to practice ordering food at a restaurant.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 chat-message opacity-0">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white font-semibold">🤖</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Coach Bot</p>
                          <div className="mt-1 p-3 rounded-lg bg-sky-50 text-gray-700 message-bubble">
                            Great! Let&apos;s role-play at a cafe. I&apos;ll give feedback based on your classroom rubric.
                          </div>
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            ✓ Fluency: Good sentence structure
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 chat-message opacity-0">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">S</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Student</p>
                          <div className="mt-1 p-3 rounded-lg bg-indigo-50 text-gray-700 message-bubble">
                            Hello, I would like a coffee and sandwich please.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 chat-message opacity-0">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white font-semibold">🤖</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Coach Bot</p>
                          <div className="mt-1 p-3 rounded-lg bg-sky-50 text-gray-700 message-bubble">
                            Good job! That&apos;s polite and clear. You could also say &ldquo;May I have...&rdquo; for more formality.
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="text-xs text-green-600 font-medium">
                              ✓ Pronunciation: Clear enunciation
                            </div>
                            <div className="text-xs text-blue-600 font-medium">
                              ✓ Vocabulary: Good word choice
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 chat-message opacity-0">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">S</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Student</p>
                          <div className="mt-1 p-3 rounded-lg bg-indigo-50 text-gray-700 message-bubble">
                            May I have a cappuccino and a tuna sandwich?
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 chat-message opacity-0">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white font-semibold">🤖</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Coach Bot</p>
                          <div className="mt-1 p-3 rounded-lg bg-sky-50 text-gray-700 message-bubble">
                            Perfect! That&apos;s much more natural. Well done!
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="text-xs text-green-600 font-medium">
                              ✓ Fluency: Natural phrasing
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              ✓ Vocabulary: Appropriate level
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 chat-message opacity-0" style={{ animationDelay: '3.8s' }}>
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white font-semibold">🤖</span>
                        <div className="flex-1">
                          <div className="mt-1 p-3 rounded-lg bg-sky-50 text-gray-700 message-bubble">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 rounded-lg bg-gray-100 p-3 text-xs text-gray-700">
                      Messages are saved to your classroom. Teachers track progress and refine rubrics.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8" id="features">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for every role</h2>
          <p className="mt-3 text-gray-600">Teacher, and Student experiences that work beautifully on any device.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-2">
          
          <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-sm font-semibold text-indigo-700">Teacher</div>
            <h3 className="mt-2 text-lg font-semibold">Classrooms and rubrics</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc pl-5">
              <li>Create classrooms and invite students</li>
              <li>Design custom rubrics for feedback</li>
              <li>Review conversations and progress</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-sm font-semibold text-indigo-700">Student</div>
            <h3 className="mt-2 text-lg font-semibold">Practice with an AI coach</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc pl-5">
              <li>Chat and audio chat with the bot</li>
              <li>Instant, rubric-aligned feedback</li>
              <li>Saved history and streaks</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-gray-600">A simple loop that reinforces speaking confidence and accuracy.</p>
          </div>
          <ol className="mt-12 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
            <li className="rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-xs font-semibold text-indigo-700">Step 1</div>
              <h3 className="mt-2 text-lg font-semibold">Teacher sets rubric</h3>
              <p className="mt-2 text-sm text-gray-600">Create classroom and add rubric criteria like fluency, pronunciation, and vocabulary.</p>
            </li>
            <li className="rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-xs font-semibold text-indigo-700">Step 2</div>
              <h3 className="mt-2 text-lg font-semibold">Student practices</h3>
              <p className="mt-2 text-sm text-gray-600">Chat or speak with the bot. The bot prepends a coaching prompt and analyzes every message.</p>
            </li>
            <li className="rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-xs font-semibold text-indigo-700">Step 3</div>
              <h3 className="mt-2 text-lg font-semibold">Feedback & tracking</h3>
              <p className="mt-2 text-sm text-gray-600">Bot responds with feedback, saves the conversation, and updates progress for teachers.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8" id="cta">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-sky-600 p-8 sm:p-10 text-white">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold">Start your first classroom today</h3>
              <p className="mt-1 text-white/90">Invite students, define rubrics, and let the AI coach do the rest.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/auth/sign-up" className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-white/90">
                Create free account
              </Link>
              <Link href="/auth/sign-in" className="inline-flex items-center justify-center rounded-md bg-transparent ring-1 ring-inset ring-white/60 px-5 py-3 text-sm font-semibold hover:bg-white/10">
                I have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} BolChaal. All rights reserved.</p>
            <div className="flex gap-5 text-sm">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it works</Link>
              <Link href="/auth/sign-up" className="text-gray-600 hover:text-gray-900">Get started</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
