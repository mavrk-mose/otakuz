"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAuth } from "@/hooks/use-auth";
import { useAnimeStore } from "@/store/use-anime-store";
import { Bookmark, Check, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BookmarkButtonProps {
  itemId: string;
  type: "anime" | "manga";
  title: string;
  image: string;
}

export function BookmarkButton({
  itemId,
  type,
  title,
  image,
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const { lists, createList, addToList, isBookmarked } = useBookmarks();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const bookmarkLoading = useAnimeStore(
    (state) => state.bookmarkLoading[itemId]
  );

  const sortedLists = [...lists].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      const newList = await createList(newListName);
      setNewListName('');
      setShowNewListInput(false);
      setSelectedListId(newList.id);
      toast.success("List created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create list.");
    }
  };

  const handleSave = async (listId: string | null) => {
    setSelectedListId(listId);
    
    if (!selectedListId) return;

    setIsSaving(true);
    try {
      await addToList(selectedListId, { id: itemId, type, title, image });
      toast.success("Saved to list!");
      setPopoverOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => (window.location.href = "/auth")}
        className="opacity-0 group-hover:opacity-50 transition-opacity absolute right-2 top-2"
      >
        <Bookmark className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setPopoverOpen(true)}
        >
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
                  className={`h-8 w- transition-colors ${
                    isBookmarked(itemId) ? "fill-primary" : ""
                  }`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-16 flex-shrink-0">
            <Image 
              src={image} 
              alt={title} 
              fill 
              className="object-cover rounded" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{title}</h4>
            <p className="text-sm text-muted-foreground capitalize">{type}</p>
          </div>
        </div>

        {showNewListInput ? (
          <div className="flex gap-2">
            <Input
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            />
            <Button onClick={handleCreateList}>Create</Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowNewListInput(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New List
          </Button>
        )}

        <ScrollArea className="h-[250px] pr-2">
          <div className="space-y-2">
            {sortedLists.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground">
                No lists yet. Create one to get started!
              </p>
            ) : (
              sortedLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleSave(list.id)}
                  className="flex items-center w-full gap-2 p-2 rounded hover:bg-muted transition"
                >
                  <div className="w-10 h-10 relative rounded overflow-hidden bg-muted shrink-0">
                    <Image 
                      src={list?.items[0]?.image} 
                      alt={list.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <span className="text-left text-sm">{list.name}</span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPopoverOpen(false)}>
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// <BookmarkDialog
//             isOpen={showBookmarkDialog}
//             onClose={() => setShowBookmarkDialog(false)}
//             item={{ id: itemId, type, title, image }}
//         />