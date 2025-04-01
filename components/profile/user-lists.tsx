"use client"

import { useBookmarks } from '@/hooks/use-bookmarks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Share2, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface UserListsProps {
  userId: string;
  onShare?: (listData: any) => void;
}

export function UserLists({ userId, onShare }: UserListsProps) {
  const { lists, useListItems, deleteList } = useBookmarks();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <AnimatePresence>
        {lists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            onShare={onShare}
            onDelete={deleteList}
            useListItems={useListItems}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function ListCard({ list, onShare, onDelete, useListItems }: any) {
  const { ref, inView } = useInView();
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useListItems(list.id);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allItems = data?.pages.flatMap(page => page.items) || [];


  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  
  return (
    <motion.div
      variants={item}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{list.name}</h3>
          <div className="flex gap-2">
            {onShare && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onShare({
                  type: 'list',
                  data: {
                    id: list.id,
                    title: list.name,
                    image: allItems[0]?.image || '',
                    items: allItems
                  }
                })}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            {list.type === 'custom' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(list.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-48">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {allItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/${item.type}/${item.id}`}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium line-clamp-1">
                      {item.title}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasNextPage && (
            <div
              ref={ref}
              className="flex justify-center mt-4"
            >
              {isFetchingNextPage ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchNextPage()}
                >
                  Load more
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </Card>
    </motion.div>
  );
}