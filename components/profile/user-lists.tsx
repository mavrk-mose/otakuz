"use client";

import { useState } from "react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Share2, Trash2, Plus, Users, Lock, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import Masonry from "react-masonry-css";
import { BookmarkedItem, BookmarkList } from "@/hooks/use-bookmarks";
import { DocumentSnapshot } from "firebase/firestore";

interface UserListsProps {
  userId: string;
  onShare?: (listData: any) => void;
}

export function UserLists({ userId, onShare }: UserListsProps) {
  const { lists, useListItems, deleteList, updateListSettings } =
    useBookmarks();
  const [selectedList, setSelectedList] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [listSettingsOpen, setListSettingsOpen] = useState(false);
  const [expandedList, setExpandedList] = useState<string | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const handleDeleteList = async () => {
    if (selectedList) {
      await deleteList(selectedList.id);
      setDeleteConfirmOpen(false);
      setSelectedList(null);
    }
  };

  const handleUpdateSettings = async (settings: any) => {
    if (selectedList) {
      await updateListSettings(selectedList.id, settings);
      setListSettingsOpen(false);
    }
  };

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onShare={onShare}
              onDelete={(list: BookmarkList) => {
                setSelectedList(list);
                setDeleteConfirmOpen(true);
              }}
              onSettings={(list: BookmarkList) => {
                setSelectedList(list);
                setListSettingsOpen(true);
              }}
              expanded={expandedList === list.id}
              onExpand={() =>
                setExpandedList(expandedList === list.id ? null : list.id)
              }
              useListItems={useListItems}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete `&quot;`{selectedList?.name}`&quot;`? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteList}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={listSettingsOpen} onOpenChange={setListSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Collaboration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to add items to this list
                </p>
              </div>
              <Switch
                checked={selectedList?.collaborative}
                onCheckedChange={(checked) =>
                  handleUpdateSettings({ collaborative: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public List</Label>
                <p className="text-sm text-muted-foreground">
                  Make this list visible to everyone
                </p>
              </div>
              <Switch
                checked={selectedList?.public}
                onCheckedChange={(checked) =>
                  handleUpdateSettings({ public: checked })
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ListCard({
  list,
  onShare,
  onDelete,
  onSettings,
  expanded,
  onExpand,
  useListItems,
}: any) {
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useListItems(
    list.id
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  interface PageType {
    items: BookmarkedItem[];
    lastDoc: DocumentSnapshot | null;
  }

  const allItems: BookmarkedItem[] =
    data?.pages.flatMap((page: PageType) => page.items) || [];
  const previewItems = allItems.slice(0, 3);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (expanded) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="col-span-full"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{list.name}</h2>
              {list.collaborative && (
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
              {list.public ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <Button variant="ghost" onClick={onExpand}>
              Close
            </Button>
          </div>

          <Masonry
            breakpointCols={{
              default: 4,
              1100: 3,
              700: 2,
              500: 1,
            }}
            className="flex -ml-4"
            columnClassName="pl-4"
          >
            {allItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-4"
              >
                <Link href={`/${item.type}/${item.id}`}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden group">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-medium">{item.title}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </Masonry>

          {hasNextPage && (
            <div ref={ref} className="flex justify-center mt-6">
              {isFetchingNextPage ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Button onClick={() => fetchNextPage()}>Load more</Button>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={item}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{list.name}</h3>
            {list.collaborative && (
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
            {list.public ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex gap-2">
            {onShare && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  onShare({
                    type: "list",
                    data: {
                      id: list.id,
                      title: list.name,
                      image: previewItems[0]?.image || "",
                      items: previewItems,
                    },
                  })
                }
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSettings(list)}
            >
              <Users className="h-4 w-4" />
            </Button>
            {list.type === "custom" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(list)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {previewItems.map((item, index) => (
            <div
              key={item.id}
              className="relative aspect-square rounded overflow-hidden"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
              {index === 2 && allItems.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium">
                    +{allItems.length - 3}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full" onClick={onExpand}>
          View All
        </Button>
      </Card>
    </motion.div>
  );
}
