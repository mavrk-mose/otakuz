"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAuth } from "@/hooks/use-auth";
import { useAnimeStore } from "@/store/use-anime-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Bookmark, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

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
  const { 
    lists, 
    addToList, 
    removeFromList, 
    createList, 
    isBookmarked 
  } = useBookmarks();

  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [newListName, setNewListName] = useState("");

  const bookmarkLoading = useAnimeStore(
    (state) => state.bookmarkLoading[itemId]
  );

  const sortedLists = [...lists].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleAddToList = async (listId: string) => {
    try {
      await addToList(listId, { id: itemId, type, title, image });
      toast.success("Item added to list successfully!");
    } catch (error) {
      console.error("Error adding item to list:", error);
      toast.error("Failed to add item to list.");
    }
  };

  const handleRemoveFromList = async (listId: string) => {
    try {
      await removeFromList(listId, itemId);
      toast.success("Item removed from list successfully!");
    } catch(error) {
       console.error("Error removing item from list:", error);
       toast.error("Failed to remove item from list.");
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      const newList = await createList(newListName);
      if (newList?.id) {
        await addToList(newList.id, { id: itemId, type, title, image });
      }
      toast.success("List created and item added successfully!");
    } catch (error) {
      console.error("Error creating list or adding item:", error);
      toast.error("Failed to create list or add item.");
    } finally {
      setNewListName("");
      setShowNewListDialog(false);
    }
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => (window.location.href = "/auth")}
        className="opacity-50"
      >
        <Bookmark className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <Dialog open={showNewListDialog} onOpenChange={setShowNewListDialog}>
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
                        isBookmarked(itemId) ? "fill-primary" : ""
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortedLists.map((list) => (
              <DropdownMenuItem
                key={list.id}
                onClick={() =>
                  list.items.some((item) => item.id === itemId)
                    ? handleRemoveFromList(list.id)
                    : handleAddToList(list.id)
                }
              >
                <span className="flex-1">{list.name}</span>
                {list.items.some((item) => item.id === itemId) && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setShowNewListDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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