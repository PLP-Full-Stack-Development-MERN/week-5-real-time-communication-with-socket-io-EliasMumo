
import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { useNote, useNote as useNoteContext } from "@/context/NoteContext";
import JoinRoom from "@/components/JoinRoom";
import NotesList from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";

const Notes = () => {
  const { roomId } = useSocket();
  const { currentNote } = useNoteContext();
  
  // If not in a room, show the join room component
  if (!roomId) {
    return <JoinRoom />;
  }
  
  // If in a room but no note is selected, show the notes list
  if (roomId && !currentNote) {
    return <NotesList />;
  }
  
  // If in a room and a note is selected, show the note editor
  return <NoteEditor />;
};

export default Notes;
