"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/news", icon: Newspaper, label: "News" },
    { href: "/anime", icon: Tv2, label: "Anime" },
    { href: "/manga", icon: BookOpen, label: "Manga" },
    // { href: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { href: "/events", icon: PartyPopper, label: "Events" },
    { href: "/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 },
  }

  // Desktop sidebar
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
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="fixed left-0 top-0 bottom-0 z-50 flex-col items-center gap-2 border-r bg-background p-3 overflow-hidden hidden lg:flex"
    >
      <TooltipProvider delayDuration={0}>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-2 w-full"
        >
          <motion.div variants={item} className="w-full">
            <Link href="/" className="flex justify-center w-full">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl hover:rounded-xl transition-all duration-300">
                O
              </div>
              {isExpanded && <div className="ml-3 font-bold text-xl flex items-center">Otaku</div>}
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
                        "w-full h-12 rounded-2xl hover:rounded-xl transition-all duration-300 justify-start",
                        pathname === navItem.href && "bg-accent",
                      )}
                    >
                      <navItem.icon className="h-5 w-5 min-w-5" />
                      {isExpanded && (
                        <span className="ml-3 text-sm font-medium overflow-hidden whitespace-nowrap">
                          {navItem.label}
                        </span>
                      )}
                      <span className="sr-only">{navItem.label}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {navItem.label}
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
                  onClick={() => setTheme((theme) => (theme === "dark" ? "light" : "dark"))}
                >
                  <div className="relative h-5 w-5 min-w-5">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
                    <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
                  </div>
                  {isExpanded && <span className="ml-3 text-sm font-medium">Toggle theme</span>}
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
                    className="w-full h-12 rounded-2xl hover:rounded-xl transition-all duration-300 justify-start"
                  >
                    <Avatar className="h-8 w-8 min-w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User avatar"} />
                      <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
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
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
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
                      {isExpanded && <span className="ml-3 text-sm font-medium">Sign In</span>}
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
  )

  // Mobile menu button and sheet
  const MobileMenu = () => (
    <div className="fixed top-4 left-4 z-50 lg:hidden">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  O
                </div>
                <span className="font-bold text-xl">Otaku</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="space-y-1">
              {navItems.map((navItem) => (
                <Link key={navItem.href} href={navItem.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn("w-full justify-start h-12", pathname === navItem.href && "bg-accent")}
                  >
                    <navItem.icon className="h-5 w-5 mr-3" />
                    {navItem.label}
                  </Button>
                </Link>
              ))}
            </div>

            <div className="h-[1px] bg-border my-4" />

            <Button
              variant="ghost"
              className="justify-start h-12"
              onClick={() => setTheme((theme) => (theme === "dark" ? "light" : "dark"))}
            >
              <div className="relative h-5 w-5 mr-3">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
                <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
              </div>
              Toggle theme
            </Button>

            <div className="mt-auto">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User avatar"} />
                      <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Log out
                  </Button>
                </div>
              ) : (
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )

  return (
    <>
      <DesktopSidebar />
      <MobileMenu />
    </>
  )
}

