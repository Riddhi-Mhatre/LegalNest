import { create } from 'zustand';
import type { ChatRoom, Message } from '../types/chat.types';

interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  setRooms: (rooms: ChatRoom[]) => void;
  setActiveRoom: (roomId: string) => void;
  addMessage: (roomId: string, message: Message) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  markRoomRead: (roomId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  unreadCounts: {},

  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

  addMessage: (roomId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] ?? []), message],
      },
      unreadCounts: {
        ...state.unreadCounts,
        [roomId]: roomId !== state.activeRoomId
          ? (state.unreadCounts[roomId] ?? 0) + 1
          : 0,
      },
    })),

  setMessages: (roomId, messages) =>
    set((state) => ({ messages: { ...state.messages, [roomId]: messages } })),

  markRoomRead: (roomId) =>
    set((state) => ({ unreadCounts: { ...state.unreadCounts, [roomId]: 0 } })),
}));
