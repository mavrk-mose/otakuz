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
  Menu,
  X,
  Languages,
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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { locale, t, toggleLocale } = useI18n();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { href: "/manga", icon: BookOpen, labelKey: "nav.manga" },
    // { href: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { href: "/events", icon: PartyPopper, labelKey: "nav.events" },
    { href: "/shop", icon: ShoppingBag, labelKey: "nav.shop" },
    { href: "/chat", icon: MessageSquare, labelKey: "nav.chat" },
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
      className="fixed inset-y-0 left-0 z-50 hidden flex-col items-center gap-2 overflow-hidden border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground shadow-lg lg:flex"
    >
       <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      <TooltipProvider delayDuration={0}>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex h-full w-full flex-col items-center gap-2"
        >
          <motion.div variants={item} className="w-full">
            <Link href="/" className="flex justify-center w-full">
              <div className="flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-transparent transition-all duration-300 hover:rounded-xl">
                <Image
                  src="/assets/logo.png" 
                  alt="Otakuz Logo"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-xl object-cover"
                />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <div className="w-12 h-[2px] bg-border rounded-full my-2" />
          </motion.div>

          {navItems.map((navItem) => (
            <motion.div key={navItem.href} variants={item} className="w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={navItem.href} className="w-full">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full h-12 rounded-2xl hover:rounded-xl justify-start",
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        (navItem.href === "/"
                          ? pathname === "/"
                          : pathname === navItem.href || pathname.startsWith(`${navItem.href}/`)) &&
                          "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <navItem.icon className="h-5 w-5 min-w-5" />
                      {isExpanded && (
                        <span className="ml-3 text-sm font-medium overflow-hidden whitespace-nowrap">
                          {t(navItem.labelKey)}
                        </span>
                      )}
                      <span className="sr-only">{t(navItem.labelKey)}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {t(navItem.labelKey)}
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
                  className="w-full h-12 rounded-2xl hover:rounded-xl transition-all duration-300 justify-start"
                  onClick={toggleTheme}
                >
                  <div className="relative h-5 w-5 min-w-5">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
                    <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
                  </div>
                  {isExpanded && (
                    <span className="ml-3 text-sm font-medium">
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

  const MobileMenu = () => (
    <div className="fixed top-4 left-4 z-50 lg:hidden">
      <Sheet
          open={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
      >
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("nav.toggleMenu")}</span>
          </Button>
        </SheetTrigger>
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
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-transparent">
                  <Image
                    src="/assets/logo.png" 
                    alt="Otakuz Logo"
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                </div>
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
                      "w-full justify-start h-12",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      (navItem.href === "/"
                        ? pathname === "/"
                        : pathname === navItem.href || pathname.startsWith(`${navItem.href}/`)) &&
                        "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <navItem.icon className="h-5 w-5 mr-3" />
                    {t(navItem.labelKey)}
                  </Button>
                </Link>
              ))}
            </div>

            <div className="h-[1px] bg-border my-4" />

            <Button
              variant="ghost"
              className="justify-start h-12"
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
              className="h-12 justify-start"
              onClick={toggleLocale}
            >
              <Languages className="mr-3 h-5 w-5" />
              {locale === "en" ? t("locale.japanese") : t("locale.english")}
            </Button>

            <div className="mt-auto">
              {user ? (
                <div className="space-y-2">
                  <Link href="/profile">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                              src={user.photoURL || undefined}
                              alt={user.displayName || "User avatar"}
                          />
                          <AvatarFallback>
                            {user.displayName?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </Link>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
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
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileMenu />
    </>
  );
}
