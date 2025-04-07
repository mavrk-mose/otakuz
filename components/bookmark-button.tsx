"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAuth } from "@/hooks/use-auth";
import { useAnimeStore } from "@/store/use-anime-store";
import { Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkDialog } from "./bookmark-dialog";

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
  const { isBookmarked } = useBookmarks();
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);

  const bookmarkLoading = useAnimeStore(
    (state) => state.bookmarkLoading[itemId]
  );

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
      <>
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBookmarkDialog(true)}
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
                      className={`h-4 w-4 transition-colors ${
                          isBookmarked(itemId) ? 'fill-primary' : ''
                      }`}
                  />
                </motion.div>
            )}
          </AnimatePresence>
        </Button>

        <BookmarkDialog
            isOpen={showBookmarkDialog}
            onClose={() => setShowBookmarkDialog(false)}
            item={{ id: itemId, type, title, image }}
        />
      </>
    </>
  );
}