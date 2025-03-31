"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useAuth } from '@/hooks/use-auth';
import { useAnimeStore } from '@/store/use-anime-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bookmark, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookmarkButtonProps {
  itemId: string;
  type: 'anime' | 'manga';
  title: string;
  image: string;
}

export function BookmarkButton({ itemId, type, title, image }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { lists, addToList, removeFromList, createList, isBookmarked } = useBookmarks();
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const bookmarkLoading = useAnimeStore((state) => state.bookmarkLoading[itemId]);

  const handleAddToList = async (listId: string) => {
    await addToList(listId, { id: itemId, type, title, image });
  };

  const handleRemoveFromList = async (listId: string) => {
    await removeFromList(listId, itemId);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    const newList = await createList(newListName);
    if (newList) {
      await addToList(newList.id, { id: itemId, type, title, image });
    }
    setNewListName('');
    setShowNewListDialog(false);
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => window.location.href = '/auth'}
        className="opacity-50"
      >
        <Bookmark className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <AnimatePresence>
              {bookmarkLoading ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                />
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <Bookmark
                    className={`h-4 w-4 transition-colors ${
                      isBookmarked(itemId) ? 'fill-primary' : ''
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {lists.map((list) => (
            <DropdownMenuItem
              key={list.id}
              onClick={() => 
                list.items.some(item => item.id === itemId)
                  ? handleRemoveFromList(list.id)
                  : handleAddToList(list.id)
              }
            >
              <span className="flex-1">{list.name}</span>
              {list.items.some(item => item.id === itemId) && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={() => setShowNewListDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New List
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showNewListDialog} onOpenChange={setShowNewListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <Button onClick={handleCreateList} className="w-full">
              Create and Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}