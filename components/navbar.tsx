"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  X,
  Languages,
  Radio,
  LayoutGrid,
  Search as SearchIcon,
  CirclePlay,
  User as UserIcon,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useGlobalSearchStore } from "@/store/use-global-search-store";

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
  { href: "/chat", icon: MessageSquare, labelKey: "nav.chat" },
  { href: "#menu", icon: LayoutGrid, labelKey: "nav.toggleMenu", isMenu: true },
] as const;

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { locale, t, toggleLocale } = useI18n();
  const pathname = usePathname();
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const openSearch = useGlobalSearchStore((state) => state.openSearch);

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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 hidden h-screen flex-col overflow-hidden border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground transition-[width] duration-300 ease-in-out lg:flex",
          isExpanded ? "w-[240px]" : "w-[72px]",
        )}
      >
        <TooltipProvider delayDuration={150}>
          {/* Sidebar Header & Click Toggle */}
          {isExpanded ? (
            <div className="mb-4 flex h-12 shrink-0 items-center justify-between gap-2 px-1">
              <Link href="/" className="flex min-w-0 items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-transparent">
                  <Image
                    src="/assets/logo.png"
                    alt="Otakuz Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-2xl object-cover"
                  />
                </div>
                <span className="truncate text-lg font-bold tracking-wide">OTAKUZ</span>
              </Link>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    aria-label={t("nav.toggleMenu")}
                    aria-expanded={isExpanded}
                    className="h-9 w-9 shrink-0 rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <PanelLeftClose className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {t("nav.toggleMenu")}
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="mb-4 flex shrink-0 flex-col items-center gap-2">
              <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-2xl">
                <Image
                  src="/assets/logo.png"
                  alt="Otakuz Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-2xl object-cover"
                />
              </Link>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    aria-label={t("nav.toggleMenu")}
                    aria-expanded={isExpanded}
                    className="h-11 w-full rounded-2xl text-sidebar-foreground/80 transition-all duration-200 hover:rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <PanelLeftOpen className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {t("nav.toggleMenu")}
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Navigation Links */}
          <ScrollArea controlSize="sm" className="min-h-0 flex-1">
            <nav className="flex flex-col gap-1.5">
              {navItems.map((navItem) => {
                const isActive =
                  navItem.href === "/"
                    ? pathname === "/"
                    : pathname === navItem.href || pathname.startsWith(`${navItem.href}/`);
                return (
                  <Tooltip key={navItem.href}>
                    <TooltipTrigger asChild>
                      <Link href={navItem.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "h-11 w-full rounded-2xl transition-all duration-200 hover:rounded-xl",
                            isExpanded ? "justify-start px-3.5" : "justify-center px-0",
                            isActive &&
                              "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
                          )}
                        >
                          <navItem.icon className="h-5 w-5 shrink-0" />
                          {isExpanded && (
                            <span className="ml-3 truncate whitespace-nowrap text-sm font-medium">
                              {t(navItem.labelKey)}
                            </span>
                          )}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10} hidden={isExpanded}>
                      {t(navItem.labelKey)}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Bottom Controls */}
          <div className="mt-auto flex shrink-0 flex-col gap-1.5 border-t border-sidebar-border pt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-11 w-full rounded-2xl transition-all duration-200 hover:rounded-xl",
                    isExpanded ? "justify-start px-3.5" : "justify-center px-0",
                  )}
                  onClick={toggleTheme}
                  aria-label={t("nav.toggleTheme")}
                >
                  <div className="relative h-5 w-5 shrink-0">
                    <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </div>
                  {isExpanded && (
                    <span className="ml-3 truncate whitespace-nowrap text-sm font-medium">
                      {t("nav.toggleTheme")}
                    </span>
                  )}
                  <span className="sr-only">{t("nav.toggleTheme")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} hidden={isExpanded}>
                {t("nav.toggleTheme")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-11 w-full rounded-2xl transition-all duration-200 hover:rounded-xl",
                    isExpanded ? "justify-start px-3.5" : "justify-center px-0",
                  )}
                  onClick={toggleLocale}
                  aria-label={t("nav.switchLanguage")}
                >
                  <Languages className="h-5 w-5 shrink-0" />
                  {isExpanded && (
                    <span className="ml-3 truncate whitespace-nowrap text-sm font-medium">
                      {locale === "en" ? t("locale.japanese") : t("locale.english")}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} hidden={isExpanded}>
                {t("nav.switchLanguage")}:{" "}
                {locale === "en" ? t("locale.japanese") : t("locale.english")}
              </TooltipContent>
            </Tooltip>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-12 w-full rounded-2xl transition-all duration-200 hover:rounded-xl",
                      isExpanded ? "justify-start px-2" : "justify-center px-0",
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={user.photoURL || undefined}
                        alt={user.displayName || "User avatar"}
                      />
                      <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    {isExpanded && (
                      <span className="ml-3 max-w-[140px] truncate text-sm font-medium">
                        {user.displayName || user.email}
                      </span>
                    )}
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
                  <DropdownMenuItem onClick={handleSignOut}>{t("nav.logOut")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/auth" className="w-full">
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-11 w-full rounded-2xl transition-all duration-200 hover:rounded-xl",
                        isExpanded ? "justify-start px-3.5" : "justify-center px-0",
                      )}
                    >
                      <LogOut className="h-5 w-5 shrink-0" />
                      {isExpanded && (
                        <span className="ml-3 whitespace-nowrap text-sm font-medium">
                          {t("nav.signIn")}
                        </span>
                      )}
                      <span className="sr-only">{t("nav.signIn")}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} hidden={isExpanded}>
                  {t("nav.signIn")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
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
              <span className="text-sm font-bold uppercase tracking-wider">OTAKUZ</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {pathname === "/" ? "MENU" : pathname.replace("/", "").toUpperCase()}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openSearch()}
              className="h-9 w-9 rounded-full"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="sr-only">{t("common.search")}</span>
            </Button>

            {user && <NotificationBell />}

            <ThemeToggle className="h-8 w-8" />

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
      </header>

      {/* Mobile Bottom Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/95 px-2 py-1 shadow-lg backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-around">
          {bottomTabs.map((tab) => {
            if ("isMenu" in tab && tab.isMenu) {
              return (
                <button
                  key={tab.labelKey}
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={cn(
                    "flex h-full w-full flex-col items-center justify-center text-xs transition-colors",
                    isMobileMenuOpen
                      ? "font-semibold text-rose-500"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <tab.icon className={cn("h-5 w-5", isMobileMenuOpen && "text-rose-500")} />
                  <span className="mt-1 text-[10px] font-medium">{t(tab.labelKey)}</span>
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
                  "flex h-full w-full flex-col items-center justify-center text-xs transition-colors",
                  isActive
                    ? "font-semibold text-rose-500"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className={cn("h-5 w-5", isActive && "text-rose-500")} />
                <span className="mt-1 text-[10px] font-medium">{t(tab.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[280px] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <div className="absolute right-0 top-0 hidden">
            <SheetClose />
          </div>
          <div className="flex h-full flex-col p-4">
            <div className="mb-6 flex items-center justify-between">
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
                <span className="text-base font-bold tracking-wider">OTAKUZ</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">{t("common.close")}</span>
              </Button>
            </div>

            <ScrollArea controlSize="sm" className="max-h-[calc(100vh-220px)]">
              <div className="space-y-1">
                {navItems.map((navItem) => (
                  <Link
                    key={navItem.href}
                    href={navItem.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-11 w-full justify-start",
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        (navItem.href === "/"
                          ? pathname === "/"
                          : pathname === navItem.href || pathname.startsWith(`${navItem.href}/`)) &&
                          "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
                      )}
                    >
                      <navItem.icon className="mr-3 h-5 w-5" />
                      {t(navItem.labelKey)}
                    </Button>
                  </Link>
                ))}
              </div>
            </ScrollArea>

            <div className="my-3 h-[1px] bg-border" />

            <Button variant="ghost" className="h-11 justify-start" onClick={toggleTheme}>
              <div className="relative mr-3 h-5 w-5">
                <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </div>
              {t("nav.toggleTheme")}
            </Button>

            <Button variant="ghost" className="h-11 justify-start" onClick={toggleLocale}>
              <Languages className="mr-3 h-5 w-5" />
              {locale === "en" ? t("locale.japanese") : t("locale.english")}
            </Button>

            <div className="mt-auto border-t border-border pt-3">
              {user ? (
                <div className="space-y-2">
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.photoURL || undefined}
                          alt={user.displayName || "User avatar"}
                        />
                        <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <p className="truncate text-sm font-medium">
                          {user.displayName || t("profile.anonymous")}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </Link>

                  <Button
                    variant="ghost"
                    className="h-10 w-full justify-start text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    {t("nav.logOut")}
                  </Button>
                </div>
              ) : (
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">
                    <LogOut className="mr-2 h-5 w-5" />
                    {t("nav.signIn")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
