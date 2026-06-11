import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRooms, getMessages } from '../services/chatService';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { ChatWindow } from '../components/chat/ChatWindow';
import { MeetingRequest } from '../components/chat/MeetingRequest';
import { Loader } from '../components/common/Loader';
import { MessageSquare, Users } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { rooms, activeRoomId, setRooms, setActiveRoom, setMessages } = useChatStore();

  const { data: fetchedRooms, isLoading: loadingRooms } = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: getRooms,
  });

  useEffect(() => {
    if (fetchedRooms) setRooms(fetchedRooms);
  }, [fetchedRooms, setRooms]);

  useEffect(() => {
    if (activeRoomId) {
      getMessages(activeRoomId).then(msgs => setMessages(activeRoomId, msgs));
    }
  }, [activeRoomId, setMessages]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-64px)]">
      <div className="card h-full flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-dark-border flex flex-col bg-dark-card/50">
          <div className="p-4 border-b border-dark-border">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <Loader size="sm" />
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <Users size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No active conversations</p>
              </div>
            ) : (
              rooms.map((room) => {
                const isActive = activeRoomId === room.roomId;
                const partner = user?.role === 'buyer' ? 'Seller' : 'Buyer';
                return (
                  <button
                    key={room.roomId}
                    onClick={() => setActiveRoom(room.roomId)}
                    className={`w-full text-left p-4 border-b border-dark-border transition-colors hover:bg-dark-hover ${
                      isActive ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">{partner} - Prop #{room.transactionId.slice(-4)}</span>
                      {room.lastMessage && (
                        <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                          {formatRelativeTime(room.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">
                      {room.lastMessage?.content || 'Started a conversation'}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col">
          {activeRoomId ? (
            <>
              <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-card/80 backdrop-blur-md">
                <h3 className="font-semibold">Secure Communication</h3>
                <MeetingRequest roomId={activeRoomId} />
              </div>
              <div className="flex-1 overflow-hidden relative">
                <ChatWindow roomId={activeRoomId} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-dark-hover flex items-center justify-center mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2 text-white">Your Secure Inbox</h3>
              <p className="text-sm max-w-md">Select a conversation to start chatting. All messages are encrypted and monitored for your safety.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
