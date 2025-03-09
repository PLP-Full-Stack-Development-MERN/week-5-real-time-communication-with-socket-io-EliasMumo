
import { useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const JoinRoom = () => {
  const { joinRoom, connected } = useSocket();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      setIsJoining(true);
      joinRoom(roomId.trim(), username.trim());
      setIsJoining(false);
    }
  };

  // Generate a random room ID
  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md glass-card animate-slide-in">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-center">Collaborative Notes</CardTitle>
          <CardDescription className="text-center mt-2">Join a room to start collaborating in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Your Name
              </label>
              <Input
                id="username"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="subtle-input"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="roomId" className="text-sm font-medium">
                  Room ID
                </label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={generateRoomId}
                  className="text-xs"
                >
                  Generate
                </Button>
              </div>
              <Input
                id="roomId"
                placeholder="Enter room ID or generate one"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="subtle-input"
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleJoin} 
            disabled={!connected || !roomId.trim() || !username.trim() || isJoining}
            className="w-full"
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Room"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinRoom;
