"use client";

import { I18nText } from "@/components/i18n-text";

import { EmptyState } from "@/components/empty-state";

import { useState } from "react";
import { BoardSkeleton } from "@/components/skeletons/board-skeleton";
import { useBookmarks, BookmarkList, BookmarkedItem } from "@/hooks/use-bookmarks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Trash2, Plus, Users, Lock, Globe, Sparkles } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import Masonry from "react-masonry-css";
import { DocumentSnapshot } from "firebase/firestore";
import { useI18n } from "@/components/i18n-provider";
import { toast } from "sonner";

interface UserListsProps {
  userId: string;
  onShare?: (listData: any) => void;
}

export function UserLists({ userId, onShare }: UserListsProps) {
  const { t: localizedT } = useI18n();
  const { t } = useI18n();
  const { lists, listsLoading, isOwner, useListItems, deleteList, updateListSettings, createList } =
    useBookmarks(userId);

  const [selectedList, setSelectedList] = useState<BookmarkList | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [listSettingsOpen, setListSettingsOpen] = useState(false);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [expandedList, setExpandedList] = useState<string | null>(null);

  // New board form state
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardPublic, setNewBoardPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const handleDeleteList = async () => {
    if (selectedList) {
      try {
        await deleteList(selectedList.id);
        toast.success(localizedT("board.deleted"));
        setDeleteConfirmOpen(false);
        setSelectedList(null);
      } catch (err) {
        console.error(err);
        toast.error(localizedT("board.deleteFailed"));
      }
    }
  };

  const handleUpdateSettings = async (settings: Partial<BookmarkList>) => {
    if (selectedList) {
      try {
        await updateListSettings(selectedList.id, settings);
        setSelectedList((prev) => (prev ? { ...prev, ...settings } : null));
        toast.success(localizedT("board.updated"));
      } catch (err) {
        console.error(err);
        toast.error(localizedT("board.updateFailed"));
      }
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    setIsCreating(true);
    try {
      await createList(newBoardName.trim(), "custom", newBoardPublic);
      toast.success(
        newBoardPublic ? localizedT("board.createdPublic") : localizedT("board.createdSecret"),
      );
      setNewBoardName("");
      setNewBoardPublic(true);
      setCreateBoardOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(localizedT("board.createFailed"));
    } finally {
      setIsCreating(false);
    }
  };

  const sortedLists = [...lists].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <div className="space-y-6">
      {/* Header bar with Board Counter and Create Board button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>
              <I18nText message="profile.savedBoards" />
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {sortedLists.length}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isOwner ? localizedT("board.ownerDescription") : localizedT("board.memberDescription")}
          </p>
        </div>

        {isOwner && (
          <Button
            onClick={() => setCreateBoardOpen(true)}
            size="sm"
            className="bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-md shadow-rose-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <I18nText message="board.createButton" />
          </Button>
        )}
      </div>

      {listsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <BoardSkeleton key={i} />
          ))}
        </div>
      ) : sortedLists.length === 0 ? (
        <Card className="p-6 text-center border-dashed border-border bg-card/40">
          <EmptyState
            illustration="collection"
            className="py-0"
            title={isOwner ? localizedT("board.collectionStarts") : localizedT("board.noPublic")}
            description={
              isOwner
                ? localizedT("board.firstDescription")
                : localizedT("board.noPublicDescription")
            }
          />
          {isOwner && (
            <Button
              onClick={() => setCreateBoardOpen(true)}
              className="mt-5 bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              <I18nText message="board.createFirst" />
            </Button>
          )}
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {sortedLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                isOwner={isOwner}
                onShare={onShare}
                onDelete={(targetList: BookmarkList) => {
                  setSelectedList(targetList);
                  setDeleteConfirmOpen(true);
                }}
                onSettings={(targetList: BookmarkList) => {
                  setSelectedList(targetList);
                  setListSettingsOpen(true);
                }}
                expanded={expandedList === list.id}
                onExpand={() => setExpandedList(expandedList === list.id ? null : list.id)}
                useListItems={useListItems}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Board Modal */}
      <Dialog open={createBoardOpen} onOpenChange={setCreateBoardOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              <I18nText message="board.create" />
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              <I18nText message="board.introduction" />
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="board-name" className="text-xs font-semibold text-foreground">
                <I18nText message="board.name" />
              </Label>
              <Input
                id="board-name"
                placeholder={localizedT("board.nameExample")}
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {newBoardPublic ? (
                    <Globe className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-amber-500" />
                  )}
                  <Label className="text-sm font-semibold text-foreground">
                    {newBoardPublic ? localizedT("board.public") : localizedT("board.secret")}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {newBoardPublic
                    ? localizedT("board.publicDescription")
                    : localizedT("board.secretDescription")}
                </p>
              </div>
              <Switch
                checked={newBoardPublic}
                onCheckedChange={setNewBoardPublic}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateBoardOpen(false)}
              className="border-border hover:bg-muted text-foreground"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreateBoard}
              disabled={!newBoardName.trim() || isCreating}
              className="bg-rose-500 hover:bg-rose-600 text-white font-medium"
            >
              {isCreating ? t("common.loading") : localizedT("board.createButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Board Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle>{t("bookmark.deleteList")}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("board.deleteNamed", { name: selectedList?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteList}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Board Settings & Privacy Modal */}
      <Dialog open={listSettingsOpen} onOpenChange={setListSettingsOpen}>
        <DialogContent className="bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle>
              <I18nText message="board.privacySettings" />
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {t("board.manageNamed", { name: selectedList?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/40">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {selectedList?.public ? (
                    <Globe className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-amber-500" />
                  )}
                  <Label className="text-sm font-semibold text-foreground">
                    {selectedList?.public
                      ? localizedT("board.public")
                      : localizedT("board.privateLabel")}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedList?.public
                    ? localizedT("board.visibleDescription")
                    : t("board.locked")}
                </p>
              </div>
              <Switch
                checked={!!selectedList?.public}
                onCheckedChange={(checked) => handleUpdateSettings({ public: checked })}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/40">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-foreground">
                  <I18nText message="board.collaborative" />
                </Label>
                <p className="text-xs text-muted-foreground">
                  <I18nText message="board.collaborativeDescription" />
                </p>
              </div>
              <Switch
                checked={!!selectedList?.collaborative}
                onCheckedChange={(checked) => handleUpdateSettings({ collaborative: checked })}
                className="data-[state=checked]:bg-rose-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setListSettingsOpen(false)}
              className="bg-muted hover:bg-muted/80 text-foreground border border-border"
            >
              <I18nText message="board.done" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ListCard({
  list,
  isOwner,
  onShare,
  onDelete,
  onSettings,
  expanded,
  onExpand,
  useListItems,
}: {
  list: BookmarkList;
  isOwner: boolean;
  onShare?: (listData: any) => void;
  onDelete: (list: BookmarkList) => void;
  onSettings: (list: BookmarkList) => void;
  expanded: boolean;
  onExpand: () => void;
  useListItems: any;
}) {
  const { t: localizedT } = useI18n();
  const { t } = useI18n();
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useListItems(list.id);

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
    data?.pages.flatMap((page: PageType) => page.items) || list.items || [];
  const previewItems = allItems.slice(0, 3);

  const item = {
    hidden: { opacity: 0, y: 16 },
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
        <Card className="p-6 bg-card border-border shadow-2xl">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-foreground">{list.name}</h2>
              <div className="flex items-center gap-1.5">
                {list.public ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <Globe className="h-3 w-3" />
                    <I18nText message="board.public" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Lock className="h-3 w-3" />
                    <I18nText message="board.secret" />
                  </span>
                )}
                {list.collaborative && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-500 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    <Users className="h-3 w-3" />
                    <I18nText message="board.collaborativeBadge" />
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onExpand}
              className="border-border bg-muted/80 hover:bg-muted text-foreground"
            >
              {t("common.close")}
            </Button>
          </div>

          {allItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>
                <I18nText message="board.noItems" />
              </p>
            </div>
          ) : (
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
              {allItems.map((boardItem, index) => (
                <motion.div
                  key={boardItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="mb-4"
                >
                  <Link href={`/${boardItem.type}/${boardItem.id}`}>
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden group border border-zinc-800/60 shadow-lg">
                      <Image
                        src={boardItem.image}
                        alt={boardItem.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                          {boardItem.type}
                        </span>
                        <p className="text-white text-sm font-bold line-clamp-2">
                          {boardItem.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </Masonry>
          )}

          {hasNextPage && (
            <div ref={ref} className="flex justify-center mt-6">
              {isFetchingNextPage ? (
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Button
                  onClick={() => fetchNextPage()}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300"
                >
                  {t("common.loadMore")}
                </Button>
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
      <Card className="group relative p-4 bg-card border-border hover:border-border/80 transition-all hover:shadow-xl rounded-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-bold text-foreground text-base truncate">{list.name}</h3>
            {list.public ? (
              <span
                className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0"
                title={localizedT("board.public")}
              >
                <Globe className="h-2.5 w-2.5" />
                <I18nText message="common.public" />
              </span>
            ) : (
              <span
                className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0"
                title={localizedT("board.secret")}
              >
                <Lock className="h-2.5 w-2.5" />
                <I18nText message="common.secret" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
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
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                title={localizedT("board.share")}
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            )}

            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSettings(list)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                  title={localizedT("board.settingsLabel")}
                >
                  <Lock className="h-3.5 w-3.5" />
                </Button>
                {list.type === "custom" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(list)}
                    className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full"
                    title={localizedT("board.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Pinterest-style Multi-Image Grid Preview */}
        <div
          onClick={onExpand}
          className="grid grid-cols-3 gap-1.5 mb-3.5 cursor-pointer rounded-xl overflow-hidden bg-muted/40 p-1 border border-border/60 group-hover:border-border transition-colors"
        >
          {previewItems.length > 0 ? (
            previewItems.map((preview, index) => (
              <div
                key={preview.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <Image
                  src={preview.image}
                  alt={preview.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {index === 2 && allItems.length > 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-white text-xs backdrop-blur-[1px]">
                    +{allItems.length - 3}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 py-10 flex flex-col items-center justify-center text-muted-foreground/60 gap-1">
              <Sparkles className="h-5 w-5 opacity-40" />
              <span className="text-xs">
                <I18nText message="board.empty" />
              </span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-border bg-card hover:bg-muted hover:text-foreground text-xs font-semibold text-foreground h-9 rounded-xl"
          onClick={onExpand}
        >
          Explore Board ({allItems.length} items)
        </Button>
      </Card>
    </motion.div>
  );
}
