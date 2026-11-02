"use client";

import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, ArrowRight, Zap, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserProfileData } from "@/types/user";

export function CommunityProfilesSection() {
  const { data: users = [], isLoading } = useQuery<UserProfileData[]>({
    queryKey: ["communityUsers"],
    queryFn: async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("isPublic", "==", true), limit(50));
        const snapshot = await getDocs(q);

        const realUsers = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            uid: docSnap.id,
            displayName: data.displayName || data.email?.split("@")[0] || "Otaku Member",
            username: data.username || `@user_${docSnap.id.slice(0, 5)}`,
            photoURL: data.photoURL || data.googlePhotoURL || "",
            googlePhotoURL: data.googlePhotoURL || null,
            bio: data.bio || "",
            isPublic: data.isPublic !== undefined ? data.isPublic : true,
            level: Number(data.level || 1),
            rank: data.rank || "Novice Explorer",
            totalExp: Number(data.totalExp || 0),
            watchedCount: Number(data.watchedCount || 0),
            readingCount: Number(data.readingCount || 0),
            boardsCount: Number(data.boardsCount || 0),
            totalSaved: Number(data.totalSaved || 0),
            preferences: data.preferences,
          } as UserProfileData;
        });

        // Sort by boards and activity first, keeping active members prominent
        realUsers.sort((a, b) => {
          if ((b.boardsCount || 0) !== (a.boardsCount || 0)) {
            return (b.boardsCount || 0) - (a.boardsCount || 0);
          }
          if ((b.level || 1) !== (a.level || 1)) {
            return (b.level || 1) - (a.level || 1);
          }
          return (b.totalSaved || 0) - (a.totalSaved || 0);
        });

        return realUsers;
      } catch (err) {
        console.warn("Could not query community users from Firebase:", err);
        return [];
      }
    },
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">
            Community Otakus
          </p>
          <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl flex items-center gap-2">
            <Users className="h-6 w-6 text-rose-500" />
            <span>Community Profiles & Saved Boards</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Discover fellow members, browse their public profiles, and explore their Pinterest-style saved collections.
          </p>
        </div>

        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:flex items-center gap-1"
          >
            <span>My Profile</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-muted/40 animate-pulse border border-border"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border bg-card/60 rounded-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-4 border border-rose-500/20">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Be the First to Join the Otakuz Community!
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            No public profiles are shared yet. Sign in, create saved boards, and make your profile public to be featured here!
          </p>
          <Link href="/profile">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white font-medium">
              Go to My Profile
            </Button>
          </Link>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {users.map((communityUser: UserProfileData) => (
            <motion.div key={communityUser.uid} variants={item}>
              <Link href={`/profile?userId=${communityUser.uid}`} className="block h-full">
                <Card className="group relative h-full flex flex-col justify-between p-5 bg-card border-border hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/5 rounded-2xl overflow-hidden">
                  {/* Glow accent on hover */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 h-24 w-24 rounded-full bg-rose-500/10 blur-xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />

                  <div>
                    {/* User Avatar + Level Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-border group-hover:border-rose-500 transition-colors shadow-md">
                          <AvatarImage
                            src={communityUser.photoURL || undefined}
                            alt={communityUser.displayName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white font-bold text-lg">
                            {communityUser.displayName[0]?.toUpperCase() || "O"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-md border-2 border-card">
                          <Zap className="h-2.5 w-2.5 fill-current" />
                        </div>
                      </div>

                      <span className="inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-500">
                        Lv. {communityUser.level}
                      </span>
                    </div>

                    {/* Identity */}
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-foreground text-base group-hover:text-rose-500 transition-colors truncate">
                        {communityUser.displayName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {communityUser.username}
                      </p>
                      <p className="text-[11px] font-medium text-amber-500/90 pt-0.5">
                        {communityUser.rank}
                      </p>
                    </div>

                    {/* Bio snippet */}
                    {communityUser.bio ? (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                        {communityUser.bio}
                      </p>
                    ) : null}
                  </div>

                  {/* Bottom Stats & CTA */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>
                        <strong className="text-foreground">
                          {communityUser.watchedCount}
                        </strong>{" "}
                        Watched
                      </span>
                      <span>·</span>
                      <span>
                        <strong className="text-foreground">
                          {communityUser.readingCount}
                        </strong>{" "}
                        Reading
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-rose-500 group-hover:translate-x-0.5 transition-transform">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{communityUser.boardsCount ?? 0} Boards</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
