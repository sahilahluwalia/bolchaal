"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { trpc } from "../_trpc/client";
import Loader from "./loader";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
  type: 'text' | 'audio';
  audioUrl?: string;
}

interface ChatInterfaceProps {
  chatName: string;
  classId: string;
  lessonId: string;
  className?: string;
  isDisabled?: boolean;
}

// Types matching server response for getLessonMessages
interface ServerMessage {
  id: string;
  content: string | null;
  isBot: boolean;
  senderId: string | null;
  senderName: string | null;
  createdAt: string | Date;
  messageType: 'TEXT' | 'AUDIO';
  attachmentUrl: string | null;
}

export function ChatInterface({ chatName, classId, lessonId, className, isDisabled }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const saveRecordingRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages for this lesson
  const { data: fetchedMessages, isLoading, isFetching } = trpc.getLessonMessages.useQuery(
    { classroomId: classId, lessonId },
    { enabled: !!classId && !!lessonId }
  );

  useEffect(() => {
    if (!fetchedMessages) return;
    const mapped: Message[] = (fetchedMessages as ServerMessage[]).map((m: ServerMessage) => ({
      id: m.id,
      content: m.content || "",
      sender: m.senderName || (m.isBot ? "AI" : "User"),
      timestamp: new Date(m.createdAt),
      isOwn: !m.isBot && !!m.senderId, // treat user-sent as own
      type: m.messageType === 'AUDIO' ? 'audio' : 'text',
      audioUrl: m.attachmentUrl ?? undefined,
    }));
    setMessages(mapped);
  }, [fetchedMessages]);

  const utils = trpc.useUtils();
  const sendMutation = trpc.sendLessonMessage.useMutation({
    onSuccess: () => {
      // We rely on the refetch to replace the optimistic message with the server version
      utils.getLessonMessages.invalidate({ classroomId: classId, lessonId });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || isDisabled) return;
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      content: newMessage,
      sender: "You",
      timestamp: new Date(),
      isOwn: true,
      type: "text",
    };
    setMessages((prev) => [...prev, optimistic]);
    const toSend = newMessage;
    setNewMessage("");
    sendMutation.mutate({ classroomId: classId, lessonId, content: toSend });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (isDisabled) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const shouldSave = saveRecordingRef.current;
        const audioChunks = audioChunksRef.current;
        const currentStream = mediaStreamRef.current;

        if (shouldSave && audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);

          const message: Message = {
            id: Date.now().toString(),
            content: "Voice message",
            sender: "You",
            timestamp: new Date(),
            isOwn: true,
            type: "audio",
            audioUrl
          };
          setMessages(prev => [...prev, message]);
        }

        // Stop all tracks to release microphone
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
        }

        // Reset refs
        audioChunksRef.current = [];
        saveRecordingRef.current = false;
        mediaStreamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = (save: boolean) => {
    if (mediaRecorderRef.current && isRecording) {
      saveRecordingRef.current = save;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col bg-gray-50 h-full ${className}`}>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {chatName.split(' ').map(word => word[0]).join('').toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{chatName}</h2>
          <div className="h-5">
            {isDisabled ? (
              <p className="text-sm text-amber-600">This lesson chat is inactive.</p>
            ) : (
              <p className="text-sm text-green-600">This lesson chat is active.</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Initial load skeletons */}
        {isLoading && (
          <>
            <Loader />
          </>
        )}

        {!isLoading && messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg ${message.isOwn ? 'items-end' : 'items-start'}`}>
              {/* Message Header for received messages */}
              {!message.isOwn && (
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-medium text-gray-700">{message.sender}</span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  message.isOwn
                    ? 'bg-green-500 text-white rounded-br-md'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                }`}
              >
                {message.type === 'text' ? (
                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                ) : (
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <Button variant="ghost" size="sm" className={`p-1 ${message.isOwn ? 'hover:bg-green-600' : 'hover:bg-gray-100'}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </Button>
                    <div className="flex-1">
                      <div className={`w-full h-1 rounded ${message.isOwn ? 'bg-green-400' : 'bg-gray-300'}`}>
                        <div className={`h-1 w-1/3 rounded ${message.isOwn ? 'bg-white' : 'bg-gray-600'}`}></div>
                      </div>
                    </div>
                    <span className={`text-xs ${message.isOwn ? 'text-green-100' : 'text-gray-500'}`}>0:15</span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className={`text-xs text-gray-500 mt-1 px-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                {formatMessageTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Typing / refetch indicator */}
        {!isLoading && (isFetching || sendMutation.isPending) && (
          <div className="flex w-full justify-start">
            <div className="flex flex-col max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg items-start">
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-xs font-medium text-gray-700">AI</span>
              </div>
              <div className="rounded-2xl px-4 py-3 shadow-sm bg-white text-gray-900 border border-gray-200 rounded-bl-md">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 px-1">typing…</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
        <div className="flex items-end gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          {isDisabled ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-gray-600 flex-1">Chat is available only when the lesson is active.</span>
              <Button variant="secondary" size="sm" disabled className="ml-3 shrink-0">
                Send
              </Button>
            </div>
          ) : isRecording ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium text-sm sm:text-base">Recording...</span>
                <span className="text-red-500 text-sm">{formatTime(recordingTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => stopRecording(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => stopRecording(true)}
                  className="ml-1"
                  variant="secondary"
                  size="sm"
                >
                  <span className="hidden sm:inline">Send</span>
                  <span className="sm:hidden">Send</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full px-0 py-1 bg-transparent border-none outline-none resize-none text-sm placeholder:text-gray-500 leading-relaxed"
                  style={{ 
                    minHeight: '24px', 
                    maxHeight: '120px',
                    overflowY: newMessage.length > 100 ? 'auto' : 'hidden'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Button
                  onMouseDown={startRecording}
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full"
                  title="Record voice message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  variant="secondary"
                  size="sm"
                >
                  <span className="hidden sm:inline">Send</span>
                  <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
