"use client";

import { useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  Home,
  Newspaper,
  Tv2,
  BookOpen,
  ShoppingBag,
  MessageSquare,
  LogOut,
  PartyPopper,
  Menu as MenuIcon,
  X,
  Languages,
  Radio,
  LayoutGrid,
  Search as SearchIcon,
  CirclePlay,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { NotificationBell } from "@/components/notification-bell";
import { Input } from "@/components/ui/input";
import { useAnimeStore } from "@/store/use-anime-store";
import { SearchDropdown } from "@/components/search-dropdown";

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { locale, t, toggleLocale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useAnimeStore();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems = [
    { href: "/", icon: Home, labelKey: "nav.home" },
    { href: "/news", icon: Newspaper, labelKey: "nav.news" },
    { href: "/anime", icon: Tv2, labelKey: "nav.anime" },
    { href: "/channels", icon: Radio, labelKey: "nav.channels" },
    { href: "/manga", icon: BookOpen, labelKey: "nav.manga" },
    { href: "/events", icon: PartyPopper, labelKey: "nav.events" },
    { href: "/shop", icon: ShoppingBag, labelKey: "nav.shop" },
    { href: "/chat", icon: MessageSquare, labelKey: "nav.chat" },
  ] as const;

  const bottomTabs = [
    { href: "/", icon: Home, labelKey: "nav.home" },
    { href: "/anime", icon: CirclePlay, labelKey: "nav.anime" },
    { href: "/manga", icon: BookOpen, labelKey: "nav.manga" },
    { href: "/chat", icon: MessageSquare, labelKey: "nav.rooms" },
    { href: "#menu", icon: LayoutGrid, labelKey: "nav.menu", isMenu: true },
  ] as const;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 },
  };

  const DesktopSidebar = () => (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{
        width: isExpanded ? "240px" : "72px",
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      }}
      className="fixed left-0 top-0 z-50 hidden lg:flex h-screen flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <TooltipProvider>
        <div className="flex h-12 items-center justify-between px-2 mb-6">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl bg-transparent">
              <Image
                src="/assets/logo.png"
                alt="Otakuz Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-2xl object-cover"
              />
            </div>
            {isExpanded && (
              <span className="font-bold text-lg whitespace-nowrap">
                OTAKUZ
              </span>
            )}
          </Link>
        </div>

        <motion.nav
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {navItems.map((navItem) => {
            const isActive =
              navItem.href === "/"
                ? pathname === "/"
                : pathname === navItem.href || pathname.startsWith(`${navItem.href}/`);
            return (
              <motion.div key={navItem.href} variants={item}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={navItem.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "h-12 w-full justify-start rounded-2xl transition-all duration-300 hover:rounded-xl",
                          isActive &&
                            "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        )}
                      >
                        <navItem.icon className="h-5 w-5 min-w-5" />
                        {isExpanded && (
                          <span className="ml-3 whitespace-nowrap text-sm font-medium">
                            {t(navItem.labelKey)}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {t(navItem.labelKey)}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            );
          })}
        </motion.nav>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-auto flex flex-col gap-2 pt-4 border-t border-sidebar-border"
        >
          <motion.div variants={item} className="w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start rounded-2xl transition-all duration-300 hover:rounded-xl"
                  onClick={toggleTheme}
                  aria-label={t("nav.toggleTheme")}
                >
                  <div className="relative h-5 w-5 min-w-5">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
                    <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
                  </div>
                  {isExpanded && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {t("nav.toggleTheme")}
                    </span>
                  )}
                  <span className="sr-only">{t("nav.toggleTheme")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                {t("nav.toggleTheme")}
              </TooltipContent>
            </Tooltip>
          </motion.div>

          <motion.div variants={item} className="w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start rounded-2xl transition-all duration-300 hover:rounded-xl"
                  onClick={toggleLocale}
                  aria-label={t("nav.switchLanguage")}
                >
                  <Languages className="h-5 w-5 min-w-5" />
                  {isExpanded && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {locale === "en" ? t("locale.japanese") : t("locale.english")}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                {t("nav.switchLanguage")}: {locale === "en" ? t("locale.japanese") : t("locale.english")}
              </TooltipContent>
            </Tooltip>
          </motion.div>

          {user ? (
            <motion.div variants={item} className="w-full mt-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-2xl hover:rounded-xl transition-all duration-300 justify-start"
                  >
                    <Avatar className="h-8 w-8 min-w-8">
                      <AvatarImage
                        src={user.photoURL || undefined}
                        alt={user.displayName || "User avatar"}
                      />
                      <AvatarFallback>
                        {user.displayName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isExpanded && (
                      <span className="ml-3 text-sm font-medium truncate max-w-[140px]">
                        {user.displayName || user.email}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.displayName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    {t("nav.logOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ) : (
            <motion.div variants={item} className="w-full mt-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/auth" className="w-full">
                    <Button
                      variant="ghost"
                      className="w-full h-12 rounded-2xl hover:rounded-xl transition-all duration-300 justify-start"
                    >
                      <LogOut className="h-5 w-5 min-w-5" />
                      {isExpanded && (
                        <span className="ml-3 text-sm font-medium">
                          {t("nav.signIn")}
                        </span>
                      )}
                      <span className="sr-only">{t("nav.signIn")}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {t("nav.signIn")}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </motion.div>
      </TooltipProvider>
    </motion.aside>
  );

  const MobileHeader = () => (
    <header className="sticky top-0 z-40 lg:hidden border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/assets/logo.png"
            alt="Otakuz Logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm tracking-wider uppercase">OTAKUZ</span>
            <span className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
              {pathname === "/" ? "MENU" : pathname.replace("/", "").toUpperCase()}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="h-9 w-9 rounded-full"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="sr-only">{t("common.search")}</span>
          </Button>

          {user && <NotificationBell />}

          {user ? (
            <Link href="/profile">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link href="/auth">
              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full">
                <UserIcon className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/40 px-4 py-2 bg-background/95"
          >
            <div className="relative search-container">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder={t("search.placeholder")}
                className="pl-9 pr-8 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              {searchQuery && <SearchDropdown />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );

  const MobileBottomTabs = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#121215]/95 backdrop-blur-md border-t border-border/40 py-1 px-2">
      <div className="flex items-center justify-around h-14">
        {bottomTabs.map((tab) => {
          if ('isMenu' in tab && tab.isMenu) {
            return (
              <button
                key={tab.labelKey}
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full text-xs transition-colors",
                  isMobileMenuOpen ? "text-rose-500 font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className={cn("h-5 w-5", isMobileMenuOpen && "text-rose-500")} />
                <span className="text-[10px] mt-1 font-medium">{t(tab.labelKey)}</span>
              </button>
            );
          }

          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-xs transition-colors",
                isActive ? "text-rose-500 font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive && "text-rose-500")} />
              <span className="text-[10px] mt-1 font-medium">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  const MobileMenuSheet = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetContent side="left" className="w-[280px] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
        <div className="absolute top-0 right-0 hidden">
          <SheetClose />
        </div>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-transparent">
                <Image
                  src="/assets/logo.png"
                  alt="Otakuz Logo"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
              </div>
              <span className="font-bold text-base tracking-wider">OTAKUZ</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">{t("common.close")}</span>
            </Button>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((navItem) => (
              <Link
                key={navItem.href}
                href={navItem.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-11",
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    (navItem.href === "/"
                      ? pathname === "/"
                      : pathname === navItem.href || pathname.startsWith(`${navItem.href}/`)) &&
                      "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  )}
                >
                  <navItem.icon className="h-5 w-5 mr-3" />
                  {t(navItem.labelKey)}
                </Button>
              </Link>
            ))}
          </div>

          <div className="h-[1px] bg-border my-3" />

          <Button
            variant="ghost"
            className="justify-start h-11"
            onClick={toggleTheme}
          >
            <div className="relative h-5 w-5 mr-3">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
              <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
            </div>
            {t("nav.toggleTheme")}
          </Button>

          <Button
            variant="ghost"
            className="h-11 justify-start"
            onClick={toggleLocale}
          >
            <Languages className="mr-3 h-5 w-5" />
            {locale === "en" ? t("locale.japanese") : t("locale.english")}
          </Button>

          <div className="mt-auto pt-3 border-t border-border">
            {user ? (
              <div className="space-y-2">
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.photoURL || undefined}
                        alt={user.displayName || "User avatar"}
                      />
                      <AvatarFallback>
                        {user.displayName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-medium truncate">{user.displayName || t("profile.anonymous")}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  {t("nav.logOut")}
                </Button>
              </div>
            ) : (
              <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="default" className="w-full">
                  <LogOut className="h-5 w-5 mr-2" />
                  {t("nav.signIn")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileHeader />
      <MobileBottomTabs />
      <MobileMenuSheet />
    </>
  );
}
