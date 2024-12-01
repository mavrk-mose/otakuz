"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  const routes = [
    { href: '/news', label: 'News' },
    { href: '/anime', label: 'Anime' },
    { href: '/manga', label: 'Manga' },
    { href: '/shop', label: 'Shop' },
    { href: '/events', label: 'Events' },
    { href: '/watch', label: 'Watch'},
    { href: '/calendar', label: 'Calendar' },
    { href: '/gallery', label: 'Gallery' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={onClose}
                className={cn(
                  "flex items-center py-2 px-4 text-sm font-medium rounded-lg hover:bg-accent",
                  pathname === route.href && "bg-accent"
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}