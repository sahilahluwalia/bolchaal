'use client'
import { useParams, useRouter } from "next/navigation";
import { trpc } from "../../../../../../_trpc/client";
import { Button } from "@repo/ui/button";

type Message = {
  id: string;
  content: string | null;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    role: string;
  } | null;
};

export default function ChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const chatSessionId = params.chatSessionId as string;

  const { data: messages, isLoading, error } = 
    trpc.getChatSessionMessages.useQuery({ chatSessionId });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load chat messages</h3>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
        <div className="mt-6">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Session</h1>
            <p className="text-gray-600">Viewing conversation details</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
            <div className="text-sm text-gray-500">
              {messages?.length || 0} messages
            </div>
          </div>

          {!messages || messages.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
              <p className="mt-1 text-sm text-gray-500">This chat session doesn&apos;t have any messages yet.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message: Message) => {
                const senderRole = message.sender?.role || 'SYSTEM';
                const senderName = message.sender?.name || 'BolChaal';
                const isStudent = senderRole === 'STUDENT';
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isStudent ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-md px-4 py-3 rounded-lg ${
                        isStudent 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                          isStudent 
                            ? 'bg-blue-200 text-blue-800' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600">
                          {senderName}
                        </span>
                      </div>
                    
                      {message.content && (
                        <div className="text-base mb-1 whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </div>
                      )}
                      
                      {!message.content && (
                        <div className="text-base mb-1 text-gray-500 italic">
                          [No content available]
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Session Details */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Messages:</span>
              <span className="text-sm font-medium text-gray-900">{messages?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Student Messages:</span>
              <span className="text-sm font-medium text-gray-900">
                {messages?.filter((m: Message) => m.sender?.role === 'STUDENT').length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">AI Messages:</span>
              <span className="text-sm font-medium text-gray-900">
                {messages?.filter((m: Message) => m.sender?.role && m.sender.role !== 'STUDENT').length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
