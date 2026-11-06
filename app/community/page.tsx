"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Sparkles,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CommunityMemberSkeleton } from "@/components/skeletons/community-member-skeleton";
import { CommunityMemberCard } from "@/components/home/community-profiles-section";
import { useCommunityUsers } from "@/hooks/use-community-users";
import type { UserProfileData } from "@/types/user";

const EMPTY_USERS: UserProfileData[] = [];

type SortMode = "active" | "level" | "watched" | "name";

export default function CommunityDirectoryPage() {
  const { data, isLoading } = useCommunityUsers(500);
  const users = data ?? EMPTY_USERS;
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortMode>("active");

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? users.filter(
          (u) =>
            u.displayName.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            (u.rank && u.rank.toLowerCase().includes(q)) ||
            (u.bio && u.bio.toLowerCase().includes(q))
        )
      : [...users];

    list.sort((a, b) => {
      switch (sortBy) {
        case "level":
          return (b.level || 1) - (a.level || 1);
        case "watched":
          return (b.watchedCount || 0) - (a.watchedCount || 0);
        case "name":
          return a.displayName.localeCompare(b.displayName);
        case "active":
        default:
          if ((b.boardsCount || 0) !== (a.boardsCount || 0)) {
            return (b.boardsCount || 0) - (a.boardsCount || 0);
          }
          if ((b.level || 1) !== (a.level || 1)) {
            return (b.level || 1) - (a.level || 1);
          }
          return (b.totalSaved || 0) - (a.totalSaved || 0);
      }
    });

    return list;
  }, [searchQuery, sortBy, users]);

  return (
    <div className="container mx-auto space-y-8 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 h-8 gap-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              <Users className="h-7 w-7 text-rose-500" />
              <span>Community Otakus Directory</span>
            </h1>
            {!isLoading && (
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-0.5 text-xs font-bold text-rose-500">
                {users.length} {users.length === 1 ? "Member" : "Members"}
              </span>
            )}
          </div>

          <p className="max-w-2xl text-sm text-muted-foreground">
            Browse all public Otakuz community profiles, explore their curated saved boards, and see what fellow members are watching and reading.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-9 shrink-0 gap-2 rounded-xl border-border bg-card text-xs font-semibold hover:bg-muted"
        >
          <Link href="/profile">
            <UserIcon className="h-3.5 w-3.5 text-rose-500" />
            <span>My Profile</span>
          </Link>
        </Button>
      </div>

      {/* Search & Sort Controls */}
      <Card className="flex flex-col gap-3 rounded-2xl border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter members by name, @username, rank, or bio..."
            className="h-10 rounded-xl border-border bg-background/60 pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
          <label htmlFor="community-sort" className="text-xs font-medium text-muted-foreground">
            Sort:
          </label>
          <select
            id="community-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortMode)}
            className="h-10 rounded-xl border border-border bg-background/60 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-rose-500"
          >
            <option value="active">Most Active & Boards</option>
            <option value="level">Highest Level</option>
            <option value="watched">Most Watched</option>
            <option value="name">Alphabetical (A–Z)</option>
          </select>
        </div>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CommunityMemberSkeleton key={i} />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-card/60 p-12 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-base font-bold text-foreground">
            No matching community profiles
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search query to find other members.
          </p>
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-rose-500 hover:text-rose-600"
            >
              Clear filter
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredUsers.map((communityUser, idx) => (
            <motion.div
              key={communityUser.uid}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.25) }}
            >
              <CommunityMemberCard communityUser={communityUser} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
