import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from "sonner";

// Define the socket context type
interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  roomId: string | null;
  joinRoom: (roomId: string, username: string) => void;
  leaveRoom: () => void;
}

// Create the socket context
const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  roomId: null,
  joinRoom: () => {},
  leaveRoom: () => {},
});

// Socket provider props
interface SocketProviderProps {
  children: React.ReactNode;
}

// Define the server URL - in production, this would be your deployed backend
const SERVER_URL = 'https://socket-io-backend-demo.glitch.me';

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Create socket connection
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error("Failed to connect to server");
      setConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
      setRoomId(null);
    });

    // Store the socket in state
    setSocket(newSocket);

    // Clean up function
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Function to join a room
  const joinRoom = (roomId: string, username: string) => {
    if (socket && connected) {
      // Leave current room first if in one
      if (roomId) {
        socket.emit('leave_room', { roomId });
      }

      // Join the new room
      socket.emit('join_room', { roomId, username });
      setRoomId(roomId);
      toast.success(`Joined room: ${roomId}`);
    }
  };

  // Function to leave the current room
  const leaveRoom = () => {
    if (socket && connected && roomId) {
      socket.emit('leave_room', { roomId });
      setRoomId(null);
      toast.info("Left the room");
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, roomId, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => useContext(SocketContext);
