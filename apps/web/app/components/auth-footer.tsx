import Link from "next/link";

export function AuthFooter() {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
      <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors order-2 sm:order-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to homepage
      </Link>
      <div className="text-lg font-bold text-indigo-600 order-1 sm:order-2">BolChaal</div>
    </div>
  );
}
