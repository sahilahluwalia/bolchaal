"use client";

import { useState, useRef, useEffect } from "react";

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
  chatId: string;
  className?: string;
}

export function ChatInterface({ chatName, chatId, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hey everyone! How's the homework going?",
      sender: "Alice Johnson",
      timestamp: new Date(Date.now() - 3600000),
      isOwn: false,
      type: "text"
    },
    {
      id: "2",
      content: "I'm having trouble with question 5. Can someone help?",
      sender: "Bob Smith",
      timestamp: new Date(Date.now() - 1800000),
      isOwn: true,
      type: "text"
    },
    {
      id: "3",
      content: "Sure, I can help you with that!",
      sender: "Alice Johnson",
      timestamp: new Date(Date.now() - 900000),
      isOwn: false,
      type: "text"
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: "You",
        timestamp: new Date(),
        isOwn: true,
        type: "text"
      };
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
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

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
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
          <p className="text-sm text-gray-500">3 members</p>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.isOwn ? 'order-2' : 'order-1'}`}>
              {/* Message Header for received messages */}
              {!message.isOwn && (
                <div className="flex items-center gap-2 mb-1 ml-3">
                  <span className="text-xs font-medium text-gray-700">{message.sender}</span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.isOwn
                    ? 'bg-green-500 text-white ml-auto'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {message.type === 'text' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <button className="p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                    <div className="flex-1">
                      <div className="w-full bg-gray-300 h-1 rounded">
                        <div className="bg-gray-600 h-1 w-1/3 rounded"></div>
                      </div>
                    </div>
                    <span className="text-xs">0:15</span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right' : 'text-left ml-3'}`}>
                {formatMessageTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {isRecording ? (
          <div className="flex items-center gap-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">Recording...</span>
              <span className="text-red-500 text-sm">{formatTime(recordingTime)}</span>
            </div>
            <div className="flex-1"></div>
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop & Send
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button
                onMouseDown={startRecording}
                className="absolute right-3 bottom-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Record voice message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
