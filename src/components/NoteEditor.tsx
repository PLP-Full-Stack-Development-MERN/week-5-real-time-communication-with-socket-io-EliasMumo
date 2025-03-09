
import { useEffect, useState } from "react";
import { useNote } from "@/context/NoteContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, ArrowLeft, Users, Save } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";

const NoteEditor = () => {
  const { socket, leaveRoom, roomId } = useSocket();
  const { currentNote, updateNote, onlineUsers, setUserTyping } = useNote();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Set up debounced values for typing indicator and auto-save
  const debouncedTitle = useDebounce(title, 300);
  const debouncedContent = useDebounce(content, 500);
  
  // Update local state when the current note changes
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    }
  }, [currentNote]);
  
  // Handle typing indicator
  useEffect(() => {
    const isTyping = title !== currentNote?.title || content !== currentNote?.content;
    setUserTyping(isTyping);
    
    return () => {
      setUserTyping(false);
    };
  }, [title, content, currentNote]);
  
  // Auto-save changes
  useEffect(() => {
    if (currentNote && (debouncedTitle !== currentNote.title || debouncedContent !== currentNote.content)) {
      setSaving(true);
      updateNote({
        title: debouncedTitle,
        content: debouncedContent
      });
      setTimeout(() => setSaving(false), 500);
    }
  }, [debouncedTitle, debouncedContent]);
  
  // Get the initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Handle manual save
  const handleSave = () => {
    if (currentNote) {
      setSaving(true);
      updateNote({
        title: title,
        content: content
      });
      setTimeout(() => setSaving(false), 500);
    }
  };
  
  // Handle go back
  const handleGoBack = () => {
    leaveRoom();
  };

  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">Collaborative Notes</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex -space-x-2 mr-2">
            {onlineUsers.slice(0, 3).map((user) => (
              <Avatar key={user.id} className={`border-2 border-background ${user.isTyping ? 'animate-pulse-subtle' : ''}`}>
                <AvatarFallback className={user.isTyping ? 'bg-primary/20 text-primary' : ''}>
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
            ))}
            {onlineUsers.length > 3 && (
              <Avatar className="border-2 border-background">
                <AvatarFallback>+{onlineUsers.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>
          
          <Button variant="outline" size="sm" className="gap-1">
            <Users className="h-4 w-4" />
            <span>{onlineUsers.length}</span>
          </Button>
          
          <Button variant="default" size="sm" onClick={handleSave} disabled={saving} className="gap-1">
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            )}
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-4">
        <Card className="glass-card h-full">
          <CardHeader className="pb-0">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-xl font-medium border-none focus:ring-0 px-0 py-1"
            />
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your note here..."
              className="w-full h-[calc(100vh-250px)] resize-none border-none focus:ring-0 px-0 py-1 overflow-auto note-content"
            />
          </CardContent>
        </Card>
      </div>
      
      <footer className="p-4 border-t text-center text-sm text-muted-foreground">
        <p>Room ID: {roomId} • {saving ? 'Saving...' : 'All changes saved'}</p>
      </footer>
    </div>
  );
};

export default NoteEditor;
