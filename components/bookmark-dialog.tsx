"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {toast} from "sonner";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        type: 'anime' | 'manga';
        title: string;
        image: string;
    };
}

export function BookmarkDialog({ isOpen, onClose, item }: Props) {
    const { lists, createList, addToList } = useBookmarks();
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [showNewListInput, setShowNewListInput] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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
        } catch (error) {
            console.error('Error creating list:', error);
            toast.error("Failed creating list");
        }
    };

    const handleSave = async () => {
        if (!selectedListId) return;

        setIsSaving(true);
        try {
            await addToList(selectedListId, item);
            toast.success("Item added to list successfully!");
            onClose();
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error("Failed to add item to list.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save to Collection</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </p>
                    </div>
                </div>

                {showNewListInput ? (
                    <div className="flex gap-2">
                        <Input
                            placeholder="List name"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
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

                <ScrollArea className="h-[300px] pr-4">
                    <AnimatePresence>
                        {sortedLists.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8 text-muted-foreground"
                            >
                                Create your first list to start saving items
                            </motion.div>
                        ) : (
                            <motion.div
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.05 }
                                    }
                                }}
                                className="space-y-2"
                            >
                                {lists.map((list) => (
                                    <motion.div
                                        key={list.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            show: { opacity: 1, y: 0 }
                                        }}
                                    >
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-between ${
                                                selectedListId === list.id ? 'border-primary' : ''
                                            }`}
                                            onClick={() => setSelectedListId(list.id)}
                                        >
                                            <span>{list.name}</span>
                                            {selectedListId === list.id && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
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
                    <Button
                        onClick={handleSave}
                        disabled={!selectedListId || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}