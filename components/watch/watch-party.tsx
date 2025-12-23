"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { WatchPartyRoom } from "./watch-room";

interface WatchPartyProps {
  animeTitle: string;
  episodeNumber: number;
  videoUrl: string;
}

export function WatchParty({
  animeTitle,
  episodeNumber,
  videoUrl,
}: WatchPartyProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="gap-2 bg-transparent">
            <Users className="h-5 w-5" />
            Watch Party
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl h-[90vh] p-0">
          {!currentRoomId ? (
            <RoomSelector
              onCreateRoom={async (videoUrl: string) => {
                setIsCreating(true);
                try {
                  const res = await fetch("/api/v1/rooms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      videoUrl,
                      animeTitle,
                      episodeNumber,
                    }),
                  });
                  const data = await res.json();
                  setCurrentRoomId(data.roomId);
                } catch (error) {
                  console.error("Failed to create room:", error);
                } finally {
                  setIsCreating(false);
                }
              }}
              onJoinRoom={(roomId: string) => {
                setCurrentRoomId(roomId);
              }}
              roomIdInput={roomIdInput}
              setRoomIdInput={setRoomIdInput}
              isCreating={isCreating}
              defaultVideoUrl={videoUrl}
            />
          ) : (
            <WatchPartyRoom
              roomId={currentRoomId}
              animeTitle={animeTitle}
              episodeNumber={episodeNumber}
              onLeave={() => {
                setCurrentRoomId(null);
                setShowDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface RoomSelectorProps {
  onCreateRoom: (videoUrl: string) => Promise<void>;
  onJoinRoom: (roomId: string) => void;
  roomIdInput: string;
  setRoomIdInput: (value: string) => void;
  isCreating: boolean;
  defaultVideoUrl: string;
}

function RoomSelector({
  onCreateRoom,
  onJoinRoom,
  roomIdInput,
  setRoomIdInput,
  isCreating,
  defaultVideoUrl,
}: RoomSelectorProps) {
  const [videoUrl, setVideoUrl] = useState(defaultVideoUrl);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  useEffect(() => {
    async function fetchActiveRooms() {
      setIsLoadingRooms(true);
      try {
        const res = await fetch("/api/v1/rooms/active");
        const data = await res.json();
        setActiveRooms(data.rooms || []);
      } catch (error) {
        console.error("Failed to fetch active rooms:", error);
      } finally {
        setIsLoadingRooms(false);
      }
    }
    fetchActiveRooms();
  }, []);

  return (
    <div className="p-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Watch Party</DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="create" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Room</TabsTrigger>
          <TabsTrigger value="join">Join Room</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              placeholder="Enter video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
          <Button
            onClick={() => onCreateRoom(videoUrl)}
            disabled={!videoUrl || isCreating}
            className="w-full"
            size="lg"
          >
            {isCreating ? "Creating..." : "Create Watch Room"}
          </Button>
        </TabsContent>

        <TabsContent value="join" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              id="roomId"
              placeholder="Enter room ID"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
            />
          </div>
          <Button
            onClick={() => onJoinRoom(roomIdInput)}
            disabled={!roomIdInput}
            className="w-full"
            size="lg"
          >
            Join Room
          </Button>

          {/* Active Rooms List */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Active Rooms</h3>
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {isLoadingRooms ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading rooms...
                  </div>
                ) : activeRooms.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No active rooms
                  </div>
                ) : (
                  activeRooms.map((room) => (
                    <Card
                      key={room.roomId}
                      className="p-4 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => onJoinRoom(room.roomId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">
                            Room {room.roomId.slice(0, 8)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {room.clients?.length || 0} viewers
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {room.isPlaying ? "Playing" : "Paused"}
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


