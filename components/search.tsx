"use client"

import { useState, useRef, useEffect } from "react"
import { useAnimeStore } from "@/store/use-anime-store"
import { useAuth } from "@/hooks/use-auth"
import { SearchDropdown } from "./search-dropdown"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export function Search() {
  const { setSearchQuery, searchQuery } = useAnimeStore()
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".search-container")
      ) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  const handleSearchClick = () => {
    setIsExpanded(true)
  }

  return (
    <div className="pl-[72px]">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center px-4">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="search-container relative flex items-center">
              <AnimatePresence initial={false}>
                {isExpanded ? (
                  <motion.div
                    key="expanded"
                    initial={{ width: 40, opacity: 0.5 }}
                    animate={{ width: 300, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative"
                  >
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      ref={inputRef}
                      type="search"
                      placeholder="Search..."
                      className="pl-10 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setIsExpanded(false)
                        }
                      }}
                    />
                    {searchQuery && <SearchDropdown />}
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button variant="ghost" size="icon" onClick={handleSearchClick} className="rounded-full">
                      <SearchIcon className="h-5 w-5" />
                      <span className="sr-only">Search</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {user && <NotificationBell />}
          </div>
        </div>
      </header>
    </div>
  )
}

