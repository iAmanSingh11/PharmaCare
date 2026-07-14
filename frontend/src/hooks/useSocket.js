import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/*
 * Opens a Socket.IO connection once the user is authenticated and shows a
 * toast for real time events. Extend the event list as new notification
 * types are added on the backend.
 */
export const useSocket = (accessToken) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !accessToken) return undefined;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: accessToken },
    });
    socketRef.current = socket;

    socket.on('order:new', () => {
      toast('New order received!', { icon: '🛒' });
    });

    socket.on('order:status', ({ status }) => {
      toast(`Order status updated: ${status}`, { icon: '📦' });
    });

    return () => socket.disconnect();
  }, [user, accessToken]);

  return socketRef.current;
};
