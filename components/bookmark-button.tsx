"use client";

import { useRef, useState } from "react";
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
import { useI18n } from "@/components/i18n-provider";

interface BookmarkButtonProps {
  itemId: string;
  type: "anime" | "manga";
  title: string;
  image: string;
  onOpenChange?: (open: boolean) => void;
}

export function BookmarkButton({
  itemId,
  type,
  title,
  image,
  onOpenChange,
}: BookmarkButtonProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { lists, createList, addToList, removeFromList, isBookmarked, bookmarkPending } = useBookmarks();
  const { data: isItemBookmarked, isLoading, listIds } = isBookmarked(itemId);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const changeOpen = (open: boolean) => { setPopoverOpen(open); onOpenChange?.(open); };
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);

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
      toast.success("List created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create list.");
    }
  };

  const handleSave = async (listId: string | null) => {
    if (!listId || !user || saving.current || bookmarkPending) return;
    saving.current = true;
    setIsSaving(true);
    const removing = listIds.includes(listId);
    changeOpen(false);
    try {
      if (removing) await removeFromList(listId, itemId);
      else await addToList(listId, { id: itemId, type, title, image });
      toast.success(removing ? "Removed from list!" : "Saved to list!");
    } catch (err) {
      console.error(err);
      toast.error(removing ? "Could not remove bookmark. Your previous selection was restored." : "Could not save bookmark. Your previous selection was restored.");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => (window.location.href = "/auth")}
        aria-label="Sign in to save to a list"
        className="transition-opacity"
      >
        <Bookmark className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Popover open={popoverOpen} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="transition-opacity"
          aria-label={isItemBookmarked ? "Manage saved lists" : "Save to a list"}
          disabled={isSaving || isLoading || bookmarkPending}
          onClick={() => changeOpen(true)}
        >
          <AnimatePresence>
            {bookmarkLoading || isLoading ? (
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
                  className={`h-8 w-8 transition-colors ${
                    isItemBookmarked ? "fill-primary" : ""
                  }`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent data-bookmark-popover className="z-[80] w-80 space-y-4">
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
              placeholder={t("bookmark.listName")}
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            />
            <Button onClick={handleCreateList}>{t("common.create")}</Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowNewListInput(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("bookmark.createNew")}
          </Button>
        )}

        <ScrollArea className="h-[250px] pr-2">
          <div className="space-y-2">
            {sortedLists.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground">
                {t("bookmark.empty")}
              </p>
            ) : (
              sortedLists.map((list) => (
                <button
                  key={list.id}
                  aria-pressed={listIds.includes(list.id)}
                  disabled={isSaving || isLoading || bookmarkPending}
                  onClick={() => handleSave(list.id)}
                  className="flex items-center w-full gap-2 p-2 rounded hover:bg-muted transition"
                >
                  <div className="w-10 h-10 relative rounded overflow-hidden bg-muted shrink-0">
                    {list.items[0]?.image && <Image
                      src={list.items[0].image} 
                      alt={list.name} 
                      fill 
                      className="object-cover" 
                    />}
                  </div>
                  <span className="flex-1 text-left text-sm">{list.name}</span>
                  {listIds.includes(list.id) && <Check className="h-4 w-4" aria-label="Saved; click to remove" />}
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPopoverOpen(false)}>
            {t("common.cancel")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
