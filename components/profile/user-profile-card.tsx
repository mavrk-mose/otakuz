"use client";

import { I18nText } from "@/components/i18n-text";

import { useState } from "react";
import { User } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Pencil, Share2, Settings, Globe, Lock, ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { ShareContentModal } from "@/components/chat/share-content-modal";
import { ProfileSettingsModal } from "./profile-settings-modal";
import { UserProfileData } from "@/types/user";

interface UserProfileCardProps {
  user?: User | null;
  profile?: UserProfileData | null;
  isOwnProfile?: boolean;
  onUpdateProfile?: (updates: Partial<UserProfileData>) => Promise<void>;
  onResetGoogleAvatar?: () => Promise<void>;
  watchedCount?: number;
  readingCount?: number;
  totalExp?: string | number;
  level?: number;
  rank?: string;
}

export function UserProfileCard({
  user,
  profile,
  isOwnProfile = true,
  onUpdateProfile,
  onResetGoogleAvatar,
  watchedCount = 0,
  readingCount = 0,
  totalExp = 0,
  level = 1,
  rank = "Novice Explorer",
}: UserProfileCardProps) {
  const { t: localizedT } = useI18n();
  const { t } = useI18n();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Derived values from Firestore profile or fallback to Firebase Auth user
  const effectiveDisplayName =
    profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Otaku Member";
  const effectiveUsername = profile?.username || `@${user?.email?.split("@")[0] || "user"}`;
  const effectivePhotoURL = profile?.photoURL || user?.photoURL || undefined;
  const effectiveLevel = profile?.level || level;
  const effectiveRank = profile?.rank || rank;
  const effectiveWatchedCount = profile?.watchedCount ?? watchedCount;
  const effectiveReadingCount = profile?.readingCount ?? readingCount;
  const effectiveTotalExp = profile?.totalExp ?? totalExp;
  const effectiveBio = profile?.bio;
  const effectiveIsPublic = profile?.isPublic !== undefined ? profile.isPublic : true;

  return (
    <Card className="relative overflow-hidden bg-card border-border p-6 shadow-2xl text-card-foreground rounded-2xl">
      {/* Top Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar with Level Badge */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-20 w-20 border-2 border-rose-500/40 shadow-lg">
              <AvatarImage
                src={effectivePhotoURL}
                alt={effectiveDisplayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white font-bold text-2xl">
                {effectiveDisplayName[0]?.toUpperCase() || "R"}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md border-2 border-card"
              title={localizedT("profile.verifiedExplorer")}
            >
              <Zap className="h-3 w-3 fill-current" />
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                {effectiveDisplayName}
              </h2>
              <span className="inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-500">
                {t("profile.level")} {effectiveLevel}
              </span>
            </div>

            <p className="text-xs font-semibold text-muted-foreground">{effectiveUsername}</p>

            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{effectiveRank}</span>
              </div>

              {/* Public / Private Badge */}
              {effectiveIsPublic ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <Globe className="h-2.5 w-2.5" />
                  <I18nText message="common.public" />
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  <Lock className="h-2.5 w-2.5" />
                  <I18nText message="common.private" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsShareModalOpen(true)}
            className="h-9 w-9 rounded-full bg-muted/80 hover:bg-muted text-foreground transition-colors border border-border"
            title={localizedT("profile.shareChat")}
          >
            <Share2 className="h-4 w-4" />
            <span className="sr-only">
              <I18nText message="profile.shareProfile" />
            </span>
          </Button>

          {isOwnProfile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="h-9 w-9 rounded-full bg-muted/80 hover:bg-muted text-foreground transition-colors border border-border"
              title={localizedT("profile.settingsTitle")}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">
                <I18nText message="profile.settingsLabel" />
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Bio (if present) */}
      {effectiveBio && (
        <div className="mt-4 text-xs text-foreground/90 bg-muted/50 p-3 rounded-xl border border-border leading-relaxed">
          {effectiveBio}
        </div>
      )}

      {/* Stats Container */}
      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/30 p-4 text-center">
        <div className="space-y-1">
          <p className="text-xl font-black text-foreground">{effectiveWatchedCount}</p>
          <p className="text-[11px] font-medium text-muted-foreground">{t("profile.watched")}</p>
        </div>
        <div className="space-y-1 border-x border-border px-2">
          <p className="text-xl font-black text-foreground">{effectiveReadingCount}</p>
          <p className="text-[11px] font-medium text-muted-foreground">{t("profile.reading")}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-black text-foreground">{effectiveTotalExp}</p>
          <p className="text-[11px] font-medium text-muted-foreground">{t("profile.totalExp")}</p>
        </div>
      </div>

      {/* Settings Modal */}
      {isOwnProfile && onUpdateProfile && onResetGoogleAvatar && (
        <ProfileSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile || null}
          onSaveProfile={onUpdateProfile}
          onResetGoogleAvatar={onResetGoogleAvatar}
        />
      )}

      {/* Share to Chat Modal */}
      <ShareContentModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        payload={{
          type: "profile",
          data: {
            userId: profile?.uid || user?.uid || "",
            displayName: effectiveDisplayName,
            username: effectiveUsername,
            photoURL: effectivePhotoURL || "",
            level: effectiveLevel,
            rank: effectiveRank,
            watchedCount: effectiveWatchedCount,
            readingCount: effectiveReadingCount,
            totalExp: effectiveTotalExp,
          },
        }}
      />
    </Card>
  );
}
