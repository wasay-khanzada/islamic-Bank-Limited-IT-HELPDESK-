import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Function[]>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.io server
    const connectSocket = () => {
      try {
        // For Socket.io, we'd use io() from socket.io-client
        // For now using WebSocket as fallback
        const ws = new WebSocket(SOCKET_URL.replace('http', 'ws'));
        socketRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          // Join user room
          ws.send(JSON.stringify({
            type: 'join',
            data: { userId: user.id, role: user.role }
          }));
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          const { type, data } = message;

          // Notify all listeners for this event type
          const listeners = listenersRef.current.get(type) || [];
          listeners.forEach(listener => listener(data));
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          // Attempt to reconnect after 5 seconds
          setTimeout(connectSocket, 5000);
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);

  const on = (event: string, callback: Function) => {
    const listeners = listenersRef.current.get(event) || [];
    listeners.push(callback);
    listenersRef.current.set(event, listeners);

    return () => {
      const currentListeners = listenersRef.current.get(event) || [];
      const index = currentListeners.indexOf(callback);
      if (index > -1) {
        currentListeners.splice(index, 1);
        listenersRef.current.set(event, currentListeners);
      }
    };
  };

  const emit = (event: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: event, data }));
    }
  };

  const joinTicket = (ticketId: number) => {
    emit('joinTicket', { ticketId });
  };

  const leaveTicket = (ticketId: number) => {
    emit('leaveTicket', { ticketId });
  };

  return {
    on,
    emit,
    joinTicket,
    leaveTicket,
  };
};
