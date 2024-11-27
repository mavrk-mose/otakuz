"use client"

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart } from 'lucide-react';
import { Comment } from '@/types/anime';

interface CommentSectionProps {
  animeId: string;
}

export function CommentSection({ animeId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'user-1', // Replace with actual user ID
      username: 'User', // Replace with actual username
      content: newComment,
      timestamp: Date.now(),
      likes: 0
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleLike = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          onKeyPress={(e) => e.key === 'Enter' && addComment()}
        />
        <Button 
          onClick={addComment}
          className="mt-2 w-full"
        >
          Comment
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 border-b">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>{comment.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{comment.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1">{comment.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleLike(comment.id)}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {comment.likes}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}