
import { useState } from "react";
import { useNote } from "@/context/NoteContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NotesList = () => {
  const { notes, createNote } = useNote();
  const { leaveRoom, roomId } = useSocket();
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteTitle.trim()) {
      createNote(newNoteTitle.trim());
      setNewNoteTitle("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={leaveRoom}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">Select or Create a Note</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md glass-card">
            <DialogHeader>
              <DialogTitle>Create a new note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateNote} className="space-y-4 py-2">
              <Input
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Enter note title"
                className="subtle-input"
              />
              <DialogFooter>
                <Button type="submit" disabled={!newNoteTitle.trim()}>Create Note</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.length > 0 ? (
            notes.map((note) => (
              <Card key={note.id} className="glass-card transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium truncate">{note.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Last edited {formatDistanceToNow(note.lastModified, { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content || "Empty note"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Open</span>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-40 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No notes yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first note to start collaborating
              </p>
            </div>
          )}
        </div>
      </div>
      
      <footer className="p-4 border-t text-center text-sm text-muted-foreground">
        <p>Room ID: {roomId} • {notes.length} notes available</p>
      </footer>
    </div>
  );
};

export default NotesList;
