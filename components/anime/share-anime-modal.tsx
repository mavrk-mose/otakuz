import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebaseChatActions } from '@/hooks/use-firebase-chat-actions';
import { useToast } from '@/hooks/use-toast';
import { AnimeData } from '@/types/anime';

interface ShareAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: AnimeData; // You might want to create a proper type for this
}

export default function ShareAnimeModal({ isOpen, onClose, anime }: ShareAnimeModalProps) {
  const [selectedRoom, setSelectedRoom] = useState('');
  const { toast } = useToast();
  const { shareAnimeToChat } = useFirebaseChatActions();

  const handleShare = async () => {
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
      });
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
            <Input
              id="room"
              className="col-span-3"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleShare}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}