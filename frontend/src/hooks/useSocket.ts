import { useEffect, useRef } from 'react';
import { initSocket } from '../utils/socket';
import { useAuthStore } from '../store/authStore';
import type { Socket } from 'socket.io-client';

export const useSocket = (): Socket | null => {
  const { isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = initSocket();
    }
    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated]);

  return socketRef.current;
};
