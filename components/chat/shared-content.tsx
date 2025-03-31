"use client"

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, ShoppingBag, Newspaper, List } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SharedContentProps {
  type: 'manga' | 'event' | 'product' | 'article' | 'list';
  data: {
    id: string;
    title: string;
    image: string;
    description?: string;
    price?: number;
    date?: string;
    items?: Array<{
      id: string;
      title: string;
      image: string;
    }>;
  };
}

export function SharedContent({ type, data }: SharedContentProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'manga':
        return <BookOpen className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'product':
        return <ShoppingBag className="h-4 w-4" />;
      case 'article':
        return <Newspaper className="h-4 w-4" />;
      case 'list':
        return <List className="h-4 w-4" />;
    }
  };

  const getTypeLabel = () => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getLink = () => {
    switch (type) {
      case 'manga':
        return `/manga/${data.id}`;
      case 'event':
        return `/events/${data.id}`;
      case 'product':
        return `/shop/products/${data.id}`;
      case 'article':
        return `/news/${data.id}`;
      case 'list':
        return `/profile/${data.id}/lists`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href={getLink()}>
        <Card className="overflow-hidden">
          <div className="flex gap-4 p-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={data.image}
                alt={data.title}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getTypeIcon()}
                  {getTypeLabel()}
                </Badge>
                {data.price && (
                  <span className="text-sm font-medium">
                    ${data.price.toFixed(2)}
                  </span>
                )}
                {data.date && (
                  <span className="text-sm text-muted-foreground">
                    {data.date}
                  </span>
                )}
              </div>
              <h3 className="font-medium line-clamp-1">{data.title}</h3>
              {data.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {data.description}
                </p>
              )}
              {type === 'list' && data.items && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {data.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ))}
                  {data.items.length > 3 && (
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded text-xs">
                      +{data.items.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}