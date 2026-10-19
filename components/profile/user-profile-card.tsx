"use client";

import { useState } from "react";
import { User, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Pencil } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/use-auth-store";

interface UserProfileCardProps {
  user: User;
  watchedCount?: number;
  readingCount?: number;
  totalExp?: string | number;
  level?: number;
  rank?: string;
  username?: string;
}

export function UserProfileCard({
  user,
  watchedCount = 42,
  readingCount = 18,
  totalExp = "1,450",
  level = 24,
  rank = "S-Rank Pioneer",
  username,
}: UserProfileCardProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { setUser } = useAuthStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || "Ren");
  const [customUsername, setCustomUsername] = useState(
    username || `@${user.email?.split("@")[0] || "ren_user"}`
  );
  const [isSaving, setIsSaving] = useState(false);

  const derivedUsername =
    customUsername.startsWith("@") ? customUsername : `@${customUsername}`;

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });
      setUser({ ...auth.currentUser });
      toast({
        title: t("common.success"),
        description: t("profile.saveChanges"),
      });
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t("common.error"),
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-[#1A1A1E] border-border/50 p-6 shadow-xl text-card-foreground">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar with Lightning Badge */}
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-border/60 shadow-md">
              <AvatarImage src={user.photoURL || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white font-bold text-xl">
                {displayName[0]?.toUpperCase() || "R"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md border-2 border-[#1A1A1E]">
              <Zap className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {displayName}
              </h2>
              <span className="inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-400">
                {t("profile.level")} {level}
              </span>
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {derivedUsername}
            </p>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 pt-0.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{t("profile.rank") || rank}</span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditOpen(true)}
          className="h-9 w-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
          title={t("profile.editProfile")}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">{t("profile.editProfile")}</span>
        </Button>
      </div>

      {/* Stats Container */}
      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-border/40 bg-[#121215]/90 p-4 text-center">
        <div className="space-y-1">
          <p className="text-xl font-extrabold text-white">{watchedCount}</p>
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("profile.watched")}
          </p>
        </div>
        <div className="space-y-1 border-x border-border/30 px-2">
          <p className="text-xl font-extrabold text-white">{readingCount}</p>
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("profile.reading")}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-extrabold text-white">{totalExp}</p>
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("profile.totalExp")}
          </p>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.editProfile")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t("profile.displayName")}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="@ren_user"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? t("common.loading") : t("profile.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
