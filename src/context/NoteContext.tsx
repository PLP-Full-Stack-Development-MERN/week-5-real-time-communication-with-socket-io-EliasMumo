import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { toast } from "sonner";

// Note type definition
export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

// User type definition for online users
export interface User {
  id: string;
  username: string;
  isTyping?: boolean;
}

// NoteContext type definition
interface NoteContextType {
  currentNote: Note | null;
  notes: Note[];
  onlineUsers: User[];
  createNote: (title: string) => void;
  updateNote: (note: Partial<Note>) => void;
  setUserTyping: (isTyping: boolean) => void;
}

// Create the context
const NoteContext = createContext<NoteContextType>({
  currentNote: null,
  notes: [],
  onlineUsers: [],
  createNote: () => {},
  updateNote: () => {},
  setUserTyping: () => {},
});

// NoteProvider props
interface NoteProviderProps {
  children: React.ReactNode;
}

export const NoteProvider = ({ children }: NoteProviderProps) => {
  const { socket, roomId } = useSocket();
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle receiving the current note when joining a room
    socket.on('current_note', (note: Note) => {
      console.log('Received current note:', note);
      setCurrentNote(note);
    });

    // Handle receiving notes list
    socket.on('notes_list', (notesList: Note[]) => {
      console.log('Received notes list:', notesList);
      setNotes(notesList);
    });

    // Handle receiving note updates
    socket.on('note_updated', (updatedNote: Note) => {
      console.log('Note updated:', updatedNote);
      setCurrentNote(prev => {
        if (prev && prev.id === updatedNote.id) {
          return updatedNote;
        }
        return prev;
      });
      
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === updatedNote.id ? updatedNote : note
        )
      );
    });

    // Handle new note created
    socket.on('note_created', (newNote: Note) => {
      console.log('New note created:', newNote);
      setNotes(prev => [...prev, newNote]);
      setCurrentNote(newNote);
      toast.success('New note created');
    });

    // Handle online users update
    socket.on('online_users', (users: User[]) => {
      console.log('Online users updated:', users);
      setOnlineUsers(users);
    });

    // Handle user typing status
    socket.on('user_typing', ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
      setOnlineUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, isTyping } : user
        )
      );
    });

    // Handle user joined notification
    socket.on('user_joined', ({ username }: { username: string }) => {
      toast.success(`${username} joined the room`);
    });

    // Handle user left notification
    socket.on('user_left', ({ username }: { username: string }) => {
      toast.info(`${username} left the room`);
    });

    return () => {
      socket.off('current_note');
      socket.off('notes_list');
      socket.off('note_updated');
      socket.off('note_created');
      socket.off('online_users');
      socket.off('user_typing');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [socket]);

  // Reset state when leaving a room
  useEffect(() => {
    if (!roomId) {
      setCurrentNote(null);
      setNotes([]);
      setOnlineUsers([]);
    }
  }, [roomId]);

  // Create a new note
  const createNote = (title: string) => {
    if (socket && roomId) {
      socket.emit('create_note', { roomId, title });
    }
  };

  // Update the current note
  const updateNote = (noteUpdate: Partial<Note>) => {
    if (socket && roomId && currentNote) {
      const updatedNote = { ...currentNote, ...noteUpdate, lastModified: Date.now() };
      socket.emit('update_note', { roomId, note: updatedNote });
    }
  };

  // Set user typing status
  const setUserTyping = (isTyping: boolean) => {
    if (socket && roomId) {
      socket.emit('typing', { roomId, isTyping });
    }
  };

  return (
    <NoteContext.Provider 
      value={{ 
        currentNote, 
        notes, 
        onlineUsers, 
        createNote, 
        updateNote, 
        setUserTyping 
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

// Custom hook to use the note context
export const useNote = () => useContext(NoteContext);
