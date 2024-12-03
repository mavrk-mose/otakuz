"use client"

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatRoomProps {
  roomId: string;
  title: string;
}

interface Message {
  id: string;
  userId: string;
  message: string;
  timestamp: any;
  username?: string;
}

export function ChatRoom({ roomId, title }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'chatrooms', roomId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message))
        .reverse();

      setMessages(newMessages);
      
      // Scroll to bottom on new messages
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'chatrooms', roomId, 'messages'), {
        userId: user.uid,
        username: user.displayName || 'Anonymous',
        message: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h3 className="font-semibold">{title}</h3>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start gap-3 mb-4 ${
                message.userId === user?.uid ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar>
                <AvatarFallback>
                  {message.username?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col ${
                  message.userId === user?.uid ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    {message.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp?.toDate().toLocaleTimeString()}
                  </span>
                </div>
                <div
                  className={`mt-1 px-4 py-2 rounded-lg ${
                    message.userId === user?.uid
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}