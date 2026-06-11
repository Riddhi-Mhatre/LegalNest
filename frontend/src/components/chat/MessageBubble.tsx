import type { Message } from '../../types/chat.types';
import { formatRelativeTime } from '../../utils/formatters';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}>
    <div
      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
        isOwn
          ? 'bg-primary text-black rounded-br-sm'
          : 'bg-dark-hover border border-dark-border text-white rounded-bl-sm'
      }`}
    >
      <p className="text-sm leading-relaxed">{message.content}</p>
      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
        <span className={`text-[10px] ${isOwn ? 'text-black/60' : 'text-muted'}`}>
          {formatRelativeTime(message.timestamp)}
        </span>
        {isOwn && (message.isRead ? <CheckCheck size={10} className="text-black/60" /> : <Check size={10} className="text-black/40" />)}
      </div>
    </div>
  </div>
);
