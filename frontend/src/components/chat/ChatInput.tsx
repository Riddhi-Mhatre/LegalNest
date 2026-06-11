import { useState, KeyboardEvent } from 'react';
import { sendMessage } from '../../services/chatService';
import { useChatStore } from '../../store/chatStore';
import { sendTyping } from '../../utils/socket';
import { Send } from 'lucide-react';

interface ChatInputProps {
  roomId: string;
}

export const ChatInput = ({ roomId }: ChatInputProps) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { addMessage } = useChatStore();

  const handleSend = async () => {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(roomId, content.trim());
      addMessage(roomId, msg);
      setContent('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-dark-border p-3 flex items-end gap-2">
      <textarea
        id="chat-input"
        value={content}
        onChange={(e) => { setContent(e.target.value); sendTyping(roomId); }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Enter to send)"
        rows={1}
        className="input-field flex-1 resize-none max-h-32"
        aria-label="Type a message"
      />
      <button
        id="chat-send-btn"
        onClick={handleSend}
        disabled={!content.trim() || sending}
        className="btn-primary p-2.5 disabled:opacity-40"
        aria-label="Send message"
      >
        <Send size={16} />
      </button>
    </div>
  );
};
