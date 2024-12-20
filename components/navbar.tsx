"use client"

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { SearchDropdown } from './search-dropdown';
import { MobileNav } from './mobile-nav';
import { MobileSearch } from './mobile-search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from "@/components/notification-bell";
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {useAnimeStore} from "@/store/use-anime-store";

export default function Navbar() {
  const { setTheme } = useTheme();
  const { setSearchQuery, searchQuery } = useAnimeStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
      <header className="border-b sticky top-0 z-50 bg-background">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="text-2xl font-bold">
              Otakuz
            </Link>
            <div className="hidden md:flex items-center gap-6 ml-6">
              <Link href="/news" className="text-muted-foreground hover:text-foreground">
                News
              </Link>
              <Link href="/anime" className="text-muted-foreground hover:text-foreground">
                Anime
              </Link>
              <Link href="/manga" className="text-muted-foreground hover:text-foreground">
                Manga
              </Link>
              <Link href="/shop" className="text-muted-foreground hover:text-foreground">
                Shop
              </Link>
              <Link href="/events" className="text-muted-foreground hover:text-foreground">
                Events
              </Link>
              <Link href="/watch" className="text-muted-foreground hover:text-foreground">
                Watch
              </Link>
              <Link href="/calendar" className="text-muted-foreground hover:text-foreground">
                Calendar
              </Link>
              <Link href="/chat" className="text-muted-foreground hover:text-foreground">
                Chat
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchDropdown />
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
                <>
                  <NotificationBell/>
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User avatar'} />
                        <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </>

            ) : (
                <Button asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
            )}
          </div>
        </nav>

        <MobileNav
            isOpen={showMobileMenu}
            onClose={() => setShowMobileMenu(false)}
        />

        <MobileSearch
            isOpen={showMobileSearch}
            onClose={() => setShowMobileSearch(false)}
        />
      </header>
  );
}

