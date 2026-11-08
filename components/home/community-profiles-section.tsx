"use client";
import { I18nText } from "@/components/i18n-text";
import { useI18n } from "@/components/i18n-provider";


import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Layers,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserProfileData } from "@/types/user";
import { useCommunityUsers } from "@/hooks/use-community-users";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { CommunityMemberSkeleton } from "@/components/skeletons/community-member-skeleton";

const HOME_PREVIEW_COUNT = 10;

export function CommunityMemberCard({
  communityUser,
}: {
  communityUser: UserProfileData;
}) {
  return (
    <Link href={`/profile?userId=${communityUser.uid}`} className="block h-full">
      <Card className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border-border bg-card p-5 transition-all duration-300 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/5">
        <div className="pointer-events-none absolute right-0 top-0 -mr-8 -mt-8 h-24 w-24 rounded-full bg-rose-500/10 blur-xl transition-all group-hover:bg-rose-500/20" />

        <div>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-border shadow-md transition-colors group-hover:border-rose-500">
                <AvatarImage
                  src={communityUser.photoURL || undefined}
                  alt={communityUser.displayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-lg font-bold text-white">
                  {communityUser.displayName[0]?.toUpperCase() || "O"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-rose-500 text-white shadow-md">
                <Zap className="h-2.5 w-2.5 fill-current" />
              </div>
            </div>

            <span className="inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-500">
              Lv. {communityUser.level}
            </span>
          </div>

          <div className="space-y-0.5">
            <h3 className="truncate text-base font-bold text-foreground transition-colors group-hover:text-rose-500">
              {communityUser.displayName}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {communityUser.username}
            </p>
            <p className="pt-0.5 text-[11px] font-medium text-amber-500/90">
              {communityUser.rank}
            </p>
          </div>

          {communityUser.bio ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {communityUser.bio}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
            <span>
              <strong className="text-foreground">
                {communityUser.watchedCount}
              </strong>{" "}
              <I18nText message="chat.watchedLabel" />
            </span>
            <span>·</span>
            <span>
              <strong className="text-foreground">
                {communityUser.readingCount}
              </strong>{" "}
              <I18nText message="chat.readingLabel" />
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-rose-500 transition-transform group-hover:translate-x-0.5">
            <Layers className="h-3.5 w-3.5" />
            <span>{communityUser.boardsCount ?? 0} Boards</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function CommunityProfilesSection() {
  const { t: localizedT } = useI18n();
  const { data, isLoading } = useCommunityUsers(50);
  const allUsers: UserProfileData[] = data ?? [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const previewUsers = allUsers.slice(0, HOME_PREVIEW_COUNT);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const offset = direction === "left" ? -620 : 620;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">
            Community Otakus
          </p>
          <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">
            <Users className="h-6 w-6 text-rose-500" />
            <span><I18nText message="community.profiles" /></span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Discover fellow members, browse their public profiles, and explore their Pinterest-style saved collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollByAmount("left")}
              aria-label={localizedT("community.scrollLeft")}
              className="h-9 w-9 rounded-xl border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollByAmount("right")}
              aria-label={localizedT("community.scrollRight")}
              className="h-9 w-9 rounded-xl border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-9 gap-1.5 rounded-xl border-border bg-card px-3 text-xs font-semibold text-foreground hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <Link href="/community" aria-label={localizedT("community.showMore")}>
                    <span><I18nText message="common.showAll" /></span>
                    <ArrowUpRight className="h-4 w-4 text-rose-500" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><I18nText message="community.browse" /></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden pb-3 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[270px] shrink-0 sm:w-[285px]"><CommunityMemberSkeleton /></div>
          ))}
        </div>
      ) : previewUsers.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-card/60 p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="mb-1 text-lg font-bold text-foreground">
            Be the First to Join the Otakuz Community!
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            No public profiles are shared yet. Sign in, create saved boards, and make your profile public to be featured here!
          </p>
          <Link href="/profile">
            <Button className="bg-rose-500 font-medium text-white hover:bg-rose-600">
              Go to My Profile
            </Button>
          </Link>
        </Card>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none"
        >
          {previewUsers.map((communityUser, idx) => (
            <motion.div
              key={communityUser.uid}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.3) }}
              className="w-[270px] shrink-0 snap-start sm:w-[285px]"
            >
              <CommunityMemberCard communityUser={communityUser} />
            </motion.div>
          ))}

          {/* Show More / View All Users Card at end of horizontal scroll */}
          <div className="w-[220px] shrink-0 snap-start sm:w-[240px]">
            <Link
              href="/community"
              aria-label={localizedT("community.showAll")}
              className="block h-full"
            >
              <Card className="group flex h-full min-h-[210px] flex-col items-center justify-center gap-3 rounded-2xl border-dashed border-border bg-card/70 p-6 text-center transition-all duration-300 hover:border-rose-500/60 hover:bg-rose-500/5 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 transition-transform duration-300 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground transition-colors group-hover:text-rose-500">
                    Show All Members
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {allUsers.length > HOME_PREVIEW_COUNT
                      ? `+${allUsers.length - HOME_PREVIEW_COUNT} more otakus`
                      : `Explore directory (${allUsers.length})`}
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
