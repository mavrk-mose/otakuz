"use client";

import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserLists } from "@/components/profile/user-lists";
import { WatchHistory } from "@/components/profile/watch-history";
import { UserProfileCard } from "@/components/profile/user-profile-card";
import { ProfileSettingsModal } from "@/components/profile/profile-settings-modal";
import { motion } from "framer-motion";
import { Settings, LogOut, Lock, Shield, ArrowLeft, Globe } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useI18n } from "@/components/i18n-provider";

function ProfileContent() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");
  const isOwnProfile = !queryUserId || Boolean(user && queryUserId === user.uid);
  const targetUserId = queryUserId || user?.uid;

  const {
    profile,
    stats,
    loading: profileLoading,
    updateProfileData,
    resetToGoogleAvatar,
  } = useUserProfile(targetUserId);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!user && !queryUserId) {
      router.push("/auth");
    }
  }, [user, queryUserId, router]);

  if (!user && !queryUserId) return null;

  // If viewing someone else's profile and it is private
  if (!profileLoading && !isOwnProfile && profile && profile.isPublic === false) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-muted border border-border text-amber-500 shadow-2xl">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">This Profile is Private</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.displayName || "This otaku"} has chosen to keep their profile identity and saved boards private.
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          className="bg-rose-500 hover:bg-rose-600 text-white font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Homepage
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* If viewing another user's profile, show back button */}
      {!isOwnProfile && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <span className="text-xs text-muted-foreground">
            Viewing {profile?.displayName || "Member"}&rsquo;s Otakuz Profile
          </span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          <div className="space-y-6">
            <UserProfileCard
              user={user}
              profile={profile}
              isOwnProfile={isOwnProfile}
              watchedCount={stats?.watchedCount ?? 0}
              readingCount={stats?.readingCount ?? 0}
              totalExp={stats?.totalExp ?? 0}
              level={stats?.level ?? 1}
              rank={stats?.rank || profile?.rank || "Novice Explorer"}
              onUpdateProfile={updateProfileData}
              onResetGoogleAvatar={resetToGoogleAvatar}
            />

            <Card className="p-6 bg-card border-border shadow-xl rounded-2xl text-card-foreground">
              <h3 className="font-bold mb-4 text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Account Overview</span>
                {profile?.isPublic !== undefined && (
                  <span className="flex items-center gap-1 font-semibold normal-case text-[11px] text-muted-foreground">
                    {profile.isPublic ? (
                      <>
                        <Globe className="h-3 w-3 text-emerald-500" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 text-amber-500" />
                        Private
                      </>
                    )}
                  </span>
                )}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground text-xs">Joined Otakuz</span>
                  <span className="font-semibold text-xs text-foreground">
                    {user?.metadata.creationTime?.split("T")[0] || "2024"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground text-xs">Saved Boards</span>
                  <span className="font-semibold text-xs text-foreground">
                    {stats?.boardsCount ?? 0}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground text-xs">Saved Titles</span>
                  <span className="font-semibold text-xs text-foreground">
                    {stats?.totalSaved ?? 0}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground text-xs">Profile Visibility</span>
                  <span className="font-semibold text-xs text-foreground">
                    {profile?.isPublic !== false ? "Public Community" : "Private (Secret)"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground text-xs">Pioneer Status</span>
                  <span className="font-semibold text-xs text-amber-500">
                    {stats?.rank || profile?.rank || "Novice Explorer"}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border bg-card hover:bg-muted text-foreground"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-2 text-rose-500" />
                    {t("profile.settings")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("profile.signOut")}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Tabs defaultValue="lists" className="w-full">
              <TabsList className="mb-6 bg-muted/60 border border-border p-1 rounded-xl">
                <TabsTrigger
                  value="lists"
                  className="data-[state=active]:bg-card data-[state=active]:text-foreground font-medium"
                >
                  {isOwnProfile ? t("profile.myLists") : "Saved Boards"}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-card data-[state=active]:text-foreground font-medium"
                >
                  {t("profile.watchHistory")}
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-card data-[state=active]:text-foreground font-medium"
                >
                  {t("profile.reviews")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lists">
                {targetUserId && <UserLists userId={targetUserId} />}
              </TabsContent>

              <TabsContent value="history">
                <WatchHistory userId={targetUserId} isOwnProfile={isOwnProfile} />
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="p-12 border-border bg-card text-center rounded-2xl">
                  <p className="text-muted-foreground text-sm">
                    {t("profile.reviewsComingSoon")}
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>

      {/* Profile Settings Modal */}
      {isOwnProfile && (
        <ProfileSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onSaveProfile={updateProfileData}
          onResetGoogleAvatar={resetToGoogleAvatar}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 animate-pulse text-muted-foreground">
          Loading profile...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
