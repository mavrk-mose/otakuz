"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { SearchDropdown } from './search-dropdown';
import {useAnimeStore} from "@/store/use-anime-store";

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
  const { searchQuery, setSearchQuery } = useAnimeStore();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="top" className="h-[400px]">
        <SheetHeader>
          <SheetTitle>Search</SheetTitle>
        </SheetHeader>
        <div className="relative mt-4">
          <Input
            type="search"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <div className="absolute top-full left-0 right-0 z-50">
            <SearchDropdown onSelect={onClose} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}