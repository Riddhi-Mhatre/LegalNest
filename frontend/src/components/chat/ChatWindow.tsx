import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  roomId: string;
}

export const ChatWindow = ({ roomId }: ChatWindowProps) => {
  const { messages } = useChatStore();
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const roomMessages = messages[roomId] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  return (
    <div className="flex flex-col h-full" aria-label="Chat window">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {roomMessages.length === 0 && (
          <p className="text-muted text-xs text-center py-8">No messages yet. Say hello!</p>
        )}
        {roomMessages.map((msg) => (
          <MessageBubble
            key={msg.messageId}
            message={msg}
            isOwn={msg.senderId === user?.userId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput roomId={roomId} />
    </div>
  );
};
