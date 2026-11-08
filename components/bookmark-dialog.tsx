"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Globe, Lock } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    type: "anime" | "manga";
    title: string;
    image: string;
  };
}

export function BookmarkDialog({ isOpen, onClose, item }: Props) {
  const { t } = useI18n();
  const { lists, createList, addToList, bookmarkPending } = useBookmarks();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListPublic, setNewListPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sortedLists = [...lists].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    try {
      const newList = await createList(newListName.trim(), "custom", newListPublic);
      setNewListName("");
      setShowNewListInput(false);
      setSelectedListId(newList.id);
      toast.success(newListPublic ? "Public board created!" : "Secret board created!");
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error("Failed creating list");
    }
  };

  const handleSave = async () => {
    if (!selectedListId || isSaving || bookmarkPending) return;

    setIsSaving(true);
    try {
      onClose();
      await addToList(selectedListId, item);
      toast.success("Item added to list successfully!");
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to add item to list.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("bookmark.saveCollection")}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image src={item.image} alt={item.title} fill className="object-cover rounded" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{item.title}</h4>
            <p className="text-sm text-muted-foreground">
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </p>
          </div>
        </div>

        {showNewListInput ? (
          <div className="space-y-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="flex gap-2">
              <Input
                placeholder={t("bookmark.listName")}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateList()}
                className="bg-zinc-900 border-zinc-700"
              />
              <Button
                onClick={handleCreateList}
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                {t("common.create")}
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                {newListPublic ? (
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                )}
                {newListPublic ? "Public Board" : "Secret Board"}
              </span>
              <Switch
                checked={newListPublic}
                onCheckedChange={setNewListPublic}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed border-zinc-700"
            onClick={() => setShowNewListInput(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("bookmark.createNew")}
          </Button>
        )}

        <ScrollArea className="h-[280px] pr-4">
          <AnimatePresence>
            {sortedLists.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                {t("bookmark.empty")}
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
                className="space-y-2"
              >
                {sortedLists.map((list) => (
                  <motion.div
                    key={list.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-between h-auto py-2.5 px-3 border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 ${
                        selectedListId === list.id ? "border-rose-500 bg-rose-500/10" : ""
                      }`}
                      onClick={() => setSelectedListId(list.id)}
                    >
                      <div className="flex items-center gap-2">
                        {list.public !== false ? (
                          <Globe className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-amber-400" />
                        )}
                        <span className="font-medium text-white">{list.name}</span>
                      </div>
                      {selectedListId === list.id && <Check className="h-4 w-4 text-rose-500" />}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedListId || isSaving || bookmarkPending}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
