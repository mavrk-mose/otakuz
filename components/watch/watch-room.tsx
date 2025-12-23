import { Play, Pause, Users, Crown, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { useWatchPartyRoom } from "@/hooks/watch/use-watch-party";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useRef, useState, useEffect } from "react";
import { Label } from "recharts";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface WatchPartyRoomProps {
  roomId: string;
  animeTitle: string;
  episodeNumber: number;
  onLeave: () => void;
}

export function WatchPartyRoom({
  roomId,
  animeTitle,
  episodeNumber,
  onLeave,
}: WatchPartyRoomProps) {
  const { state, isLoading, wsSend, connectionStatus } =
    useWatchPartyRoom(roomId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHost, setIsHost] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // Determine if current user is host
  useEffect(() => {
    if (state) {
      // In a real app, you'd compare with the actual user ID
      // For now, we assume the first client is the host
      setIsHost(state.clients[0] === state.hostId);
    }
  }, [state]);

  // Sync video state with room state
  useEffect(() => {
    if (!state || !videoRef.current || isSeeking) return;

    const video = videoRef.current;

    // Update playback state
    if (state.isPlaying && video.paused) {
      video.play();
    } else if (!state.isPlaying && !video.paused) {
      video.pause();
    }

    // Sync position (with threshold to avoid constant seeking)
    const positionDiff = Math.abs(video.currentTime - state.position);
    if (positionDiff > 1) {
      video.currentTime = state.position;
    }

    // Update playback rate
    if (video.playbackRate !== state.playbackRate) {
      video.playbackRate = state.playbackRate;
    }
  }, [state, isSeeking]);

  // Handle video events (only for host)
  const handlePlay = () => {
    if (!isHost || !videoRef.current) return;
    wsSend({
      type: "play",
      position: videoRef.current.currentTime,
    });
  };

  const handlePause = () => {
    if (!isHost || !videoRef.current) return;
    wsSend({
      type: "pause",
      position: videoRef.current.currentTime,
    });
  };

  const handleSeek = () => {
    if (!isHost || !videoRef.current) return;
    setIsSeeking(false);
    wsSend({
      type: "seek",
      position: videoRef.current.currentTime,
    });
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!isHost) return;
    wsSend({
      type: "playback_rate",
      playbackRate: rate,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-bold">{animeTitle}</h2>
          <p className="text-sm text-muted-foreground">
            Episode {episodeNumber}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {connectionStatus === "open" ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {connectionStatus === "open" ? "Connected" : "Disconnected"}
            </span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {state?.clients.length || 0}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onLeave}>
            Leave
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Player */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              src={state?.videoUrl}
              className="w-full h-full"
              controls={isHost}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeeking={() => setIsSeeking(true)}
              onSeeked={handleSeek}
            />
            {!isHost && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <Badge variant="secondary" className="gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Host is controlling playback
                </Badge>
              </div>
            )}
          </div>

          {/* Host Controls */}
          {isHost && (
            <div className="p-4 bg-background/95 backdrop-blur-sm border-t space-y-3">
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.paused) {
                        videoRef.current.play();
                      } else {
                        videoRef.current.pause();
                      }
                    }
                  }}
                >
                  {state?.isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Playback Rate */}
              <div className="flex items-center gap-3">
                <Label className="text-xs whitespace-nowrap">Speed:</Label>
                <div className="flex gap-2 flex-1">
                  {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                    <Button
                      key={rate}
                      size="sm"
                      variant={
                        state?.playbackRate === rate ? "default" : "outline"
                      }
                      onClick={() => handlePlaybackRateChange(rate)}
                      className="flex-1"
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Viewers ({state?.clients.length || 0})
            </h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {state?.clients.map((clientId, index) => (
                <motion.div
                  key={clientId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {clientId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          User {clientId.slice(0, 8)}
                        </div>
                      </div>
                      {clientId === state.hostId && (
                        <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Room Info */}
          <div className="p-4 border-t space-y-2">
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Room ID:</span>
                <span className="font-mono">{roomId.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Status:</span>
                <span>{state?.isPlaying ? "Playing" : "Paused"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
