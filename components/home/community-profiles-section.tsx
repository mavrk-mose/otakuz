"use client";

import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Compass, ArrowRight, Zap, Bookmark, Layers } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserProfileData } from "@/types/user";

// Vibrant fallback community profiles to display alongside any logged-in users
const FALLBACK_PROFILES: UserProfileData[] = [
  {
    uid: "pioneer_ren",
    email: "ren@otakuz.io",
    displayName: "Ren Kisaragi",
    username: "@ren_kisaragi",
    photoURL: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
    bio: "Curator of dark fantasy & psychological anime. 100+ boards pinned.",
    isPublic: true,
    level: 32,
    rank: "Grandmaster Otaku",
    totalExp: "2,840",
    watchedCount: 84,
    readingCount: 36,
    preferences: {
      language: "en",
      soundEffects: true,
      autoplayTrailers: true,
      adultFilter: false,
      defaultBoardPublic: true,
      emailNotifications: true,
    },
  },
  {
    uid: "pioneer_aoi",
    email: "aoi@otakuz.io",
    displayName: "Aoi Shinomiya",
    username: "@aoi_shino",
    photoURL: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80",
    bio: "Slice of life connoisseur & shojo enthusiast. Follow my chill boards!",
    isPublic: true,
    level: 28,
    rank: "S-Rank Pioneer",
    totalExp: "2,120",
    watchedCount: 65,
    readingCount: 29,
    preferences: {
      language: "ja",
      soundEffects: true,
      autoplayTrailers: true,
      adultFilter: false,
      defaultBoardPublic: true,
      emailNotifications: true,
    },
  },
  {
    uid: "pioneer_kenji",
    email: "kenji@otakuz.io",
    displayName: "Kenji Sato",
    username: "@kenji_sato",
    photoURL: "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80",
    bio: "Mecha, cyberpunk, and classic 90s anime archive curator.",
    isPublic: true,
    level: 25,
    rank: "S-Rank Pioneer",
    totalExp: "1,750",
    watchedCount: 52,
    readingCount: 22,
    preferences: {
      language: "en",
      soundEffects: true,
      autoplayTrailers: true,
      adultFilter: false,
      defaultBoardPublic: true,
      emailNotifications: true,
    },
  },
  {
    uid: "pioneer_miku",
    email: "miku@otakuz.io",
    displayName: "Miku Tachibana",
    username: "@miku_t",
    photoURL: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80",
    bio: "Seasonal watcher & tournament predictor. Always tracking new releases.",
    isPublic: true,
    level: 22,
    rank: "A-Rank Strategist",
    totalExp: "1,390",
    watchedCount: 40,
    readingCount: 15,
    preferences: {
      language: "en",
      soundEffects: true,
      autoplayTrailers: true,
      adultFilter: false,
      defaultBoardPublic: true,
      emailNotifications: true,
    },
  },
];

export function CommunityProfilesSection() {
  const { data: users = [], isLoading } = useQuery<UserProfileData[]>({
    queryKey: ["communityUsers"],
    queryFn: async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("isPublic", "==", true), limit(12));
        const snapshot = await getDocs(q);

        const firestoreUsers = snapshot.docs.map((docSnap) => ({
          uid: docSnap.id,
          ...docSnap.data(),
        })) as UserProfileData[];

        // Merge real users from Firestore with community members to ensure a lively showcase
        const userIds = new Set(firestoreUsers.map((u) => u.uid));
        const extraFallbacks = FALLBACK_PROFILES.filter((fb) => !userIds.has(fb.uid));
        return [...firestoreUsers, ...extraFallbacks];
      } catch (err) {
        console.warn("Could not query community users, using active fallbacks:", err);
        return FALLBACK_PROFILES;
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
          <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl flex items-center gap-2">
            <Users className="h-6 w-6 text-rose-500" />
            <span>Community Profiles & Saved Boards</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Discover fellow members, browse their public profiles, and explore their Pinterest-style saved collections.
          </p>
        </div>

        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 hidden sm:flex items-center gap-1"
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
              className="h-56 rounded-2xl bg-zinc-900/60 animate-pulse border border-zinc-800"
            />
          ))}
        </div>
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
                <Card className="group relative h-full flex flex-col justify-between p-5 bg-[#18181b] border-zinc-800/80 hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/5 rounded-2xl overflow-hidden">
                  {/* Glow accent on hover */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 h-24 w-24 rounded-full bg-rose-500/10 blur-xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />

                  <div>
                    {/* User Avatar + Level Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-zinc-700 group-hover:border-rose-500 transition-colors shadow-md">
                          <AvatarImage
                            src={communityUser.photoURL || undefined}
                            alt={communityUser.displayName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white font-bold text-lg">
                            {communityUser.displayName[0]?.toUpperCase() || "O"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-md border-2 border-[#18181b]">
                          <Zap className="h-2.5 w-2.5 fill-current" />
                        </div>
                      </div>

                      <span className="inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-400">
                        Lv. {communityUser.level || 24}
                      </span>
                    </div>

                    {/* Identity */}
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-white text-base group-hover:text-rose-400 transition-colors truncate">
                        {communityUser.displayName}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate">
                        {communityUser.username || `@user_${communityUser.uid.slice(0, 5)}`}
                      </p>
                      <p className="text-[11px] font-medium text-amber-400/90 pt-0.5">
                        {communityUser.rank || "S-Rank Pioneer"}
                      </p>
                    </div>

                    {/* Bio snippet */}
                    {communityUser.bio && (
                      <p className="text-xs text-zinc-400/90 line-clamp-2 mt-2 leading-relaxed">
                        {communityUser.bio}
                      </p>
                    )}
                  </div>

                  {/* Bottom Stats & CTA */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span>
                        <strong className="text-white">
                          {communityUser.watchedCount || 42}
                        </strong>{" "}
                        Watched
                      </span>
                      <span>·</span>
                      <span>
                        <strong className="text-white">
                          {communityUser.readingCount || 18}
                        </strong>{" "}
                        Reading
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:translate-x-0.5 transition-transform">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Boards</span>
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
