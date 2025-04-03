"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Menu, 
  Moon, 
  Sun, 
  Trophy,
  Home,
  Newspaper,
  Tv2,
  BookOpen,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  ShoppingBag,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { SearchDropdown } from './search-dropdown';
import { MobileNav } from './mobile-nav';
import { MobileSearch } from './mobile-search';
import { NotificationBell } from '@/components/notification-bell';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAnimeStore } from '@/store/use-anime-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { setTheme } = useTheme();
  const { setSearchQuery, searchQuery } = useAnimeStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/news', icon: Newspaper, label: 'News' },
    { href: '/anime', icon: Tv2, label: 'Anime' },
    { href: '/manga', icon: BookOpen, label: 'Manga' },
    // { href: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { href: '/gallery', icon: ImageIcon, label: 'Gallery' },
    { href: '/shop', icon: ShoppingBag, label: 'Shop' },
    { href: '/chat', icon: MessageSquare, label: 'Chat' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  return (
    <>
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "72px", opacity: 1 }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center gap-2 border-r bg-background p-3"
      >
        <TooltipProvider delayDuration={0}>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center gap-2 w-full"
          >
            <motion.div variants={item} className="w-full">
              <Link href="/" className="flex justify-center">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl hover:rounded-xl transition-all duration-300">
                  O
                </div>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <div className="w-12 h-[2px] bg-border rounded-full my-2" />
            </motion.div>

            {navItems.map((item) => (
              <motion.div key={item.href} variants={item} className="w-full">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "w-full h-12 rounded-2xl hover:rounded-xl transition-all duration-300",
                          pathname === item.href && "bg-accent"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}

            <motion.div variants={item}>
              <div className="w-12 h-[2px] bg-border rounded-full my-2" />
            </motion.div>

            <motion.div variants={item} className="w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-12 rounded-2xl hover:rounded-xl transition-all duration-300"
                    onClick={() => setTheme(theme => theme === "dark" ? "light" : "dark")}
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Toggle theme
                </TooltipContent>
              </Tooltip>
            </motion.div>

            {user ? (
              <motion.div variants={item} className="w-full mt-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full h-12 rounded-2xl hover:rounded-xl transition-all duration-300"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User avatar"} />
                        <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.displayName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.div variants={item} className="w-full mt-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/auth">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-12 rounded-2xl hover:rounded-xl transition-all duration-300"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Sign In</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    Sign In
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </motion.div>
        </TooltipProvider>
      </motion.aside>

      <div className="pl-[72px]">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center px-4">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="relative">
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
              {user && <NotificationBell />}
            </div>
          </div>
        </header>
      </div>

      <MobileNav
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />

      <MobileSearch
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
      />
    </>
  );
}