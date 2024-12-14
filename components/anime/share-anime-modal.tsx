import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFirebaseChatActions } from '@/hooks/use-firebase-chat-actions';
import { useToast } from '@/hooks/use-toast';
import { AnimeData } from '@/types/anime';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useFilteredRooms from "@/hooks/use-filtered-rooms";

interface ShareAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: AnimeData;
}

export default function ShareAnimeModal({ isOpen, onClose, anime }: ShareAnimeModalProps) {
  const [selectedRoom, setSelectedRoom] = useState('');
  const { toast } = useToast();
  const { shareAnimeToChat } = useFirebaseChatActions();
  const { user } = useAuth();
  const router = useRouter();
  const { rooms, refetch } = useFilteredRooms('');  // Use an empty string to fetch all rooms

  useEffect(() => {
    if (isOpen) {
      refetch();  // Refetch rooms when the modal opens
    }
  }, [isOpen, refetch]);

  const handleShare = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to share anime.",
        variant: "destructive",
      });
      router.push('/auth');
      onClose();
      return;
    }

    if (!selectedRoom) {
      toast({
        title: "Error",
        description: "Please select a room to share to.",
        variant: "destructive",
      });
      return;
    }

    try {
      await shareAnimeToChat(selectedRoom, {
        title: anime.title,
        image: anime.images.jpg.large_image_url,
        id: anime.mal_id,
      }, user.uid);
      toast({
        title: "Success",
        description: "Anime shared to chat successfully!",
      });
      onClose();
    } catch (error) {
      console.error('Error sharing anime:', error);
      toast({
        title: "Error",
        description: "Failed to share anime. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Anime to Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room" className="text-right">
                Chat Room
              </Label>
              <Select onValueChange={setSelectedRoom} value={selectedRoom}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.title}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleShare}>
              {user ? 'Share' : 'Sign In to Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}