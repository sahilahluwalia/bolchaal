"use client";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
}
