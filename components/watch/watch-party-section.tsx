"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TopAnime, WatchParty } from '@/types/anime';
import { Users, Play, Pause } from 'lucide-react';
import { io } from 'socket.io-client';

interface WatchPartySectionProps {
  animeId: string;
  anime: TopAnime;
}

export function WatchPartySection({ animeId, anime }: WatchPartySectionProps) {
  const [party, setParty] = useState<WatchParty | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      query: { animeId }
    });

    socket.on('partyUpdate', (updatedParty: WatchParty) => {
      setParty(updatedParty);
    });

    socket.on('participantsUpdate', (updatedParticipants: string[]) => {
      setParticipants(updatedParticipants);
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [animeId]);

  const createParty = () => {
    const newParty: WatchParty = {
      id: Date.now().toString(),
      hostId: 'user-1', // Replace with actual user ID
      animeId,
      title: anime.title,
      currentTime: 0,
      isPlaying: false,
      participants: ['user-1'] // Replace with actual user ID
    };

    socket?.emit('createParty', newParty);
  };

  const joinParty = () => {
    if (party) {
      socket?.emit('joinParty', {
        partyId: party.id,
        userId: 'user-1' // Replace with actual user ID
      });
    }
  };

  const togglePlayPause = () => {
    if (party) {
      socket?.emit('togglePlayPause', {
        partyId: party.id,
        isPlaying: !party.isPlaying
      });
    }
  };

  return (
    <div className="space-y-4">
      {!party ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Create a watch party to enjoy anime together with friends!
          </p>
          <Button onClick={createParty} className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Create Watch Party
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Watch Party</h3>
            {party.hostId === 'user-1' && ( // Replace with actual user ID check
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayPause}
              >
                {party.isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Participants</h4>
            <ScrollArea className="h-[200px]">
              {participants.map((participant) => (
                <div
                  key={participant}
                  className="flex items-center gap-2 p-2"
                >
                  <Avatar>
                    <AvatarFallback>
                      {participant[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{participant}</span>
                  {party.hostId === participant && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>

          {!participants.includes('user-1') && ( // Replace with actual user ID check
            <Button onClick={joinParty} className="w-full">
              Join Watch Party
            </Button>
          )}
        </>
      )}
    </div>
  );
}