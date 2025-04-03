"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

  return (
    <>
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
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center gap-2 border-r bg-background p-3 overflow-hidden"
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
    </>
  )
}

