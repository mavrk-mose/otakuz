"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Shield,
  Sliders,
  RotateCcw,
  Globe,
  Lock,
  Volume2,
  Tv,
  EyeOff,
  Check,
  Sparkles,
} from "lucide-react";
import { UserProfileData, UserPreferences } from "@/types/user";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileData | null;
  onSaveProfile: (updates: Partial<UserProfileData>) => Promise<void>;
  onResetGoogleAvatar: () => Promise<void>;
}

const PRESET_AVATARS = [
  {
    name: "Cyber Punk",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Neon Hunter",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Mecha Pilot",
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Ronin Blade",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop&q=80",
  },
];

export function ProfileSettingsModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetGoogleAvatar,
}: ProfileSettingsModalProps) {
  const { t, locale, setLocale } = useI18n();

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Platform preferences
  const [language, setLanguage] = useState<"en" | "ja">("en");
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoplayTrailers, setAutoplayTrailers] = useState(true);
  const [adultFilter, setAdultFilter] = useState(false);
  const [defaultBoardPublic, setDefaultBoardPublic] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setUsername(profile.username?.replace(/^@/, "") || "");
      setBio(profile.bio || "");
      setPhotoURL(profile.photoURL || "");
      setIsPublic(profile.isPublic !== undefined ? profile.isPublic : true);

      if (profile.preferences) {
        setLanguage(profile.preferences.language || "en");
        setSoundEffects(
          profile.preferences.soundEffects !== undefined
            ? profile.preferences.soundEffects
            : true
        );
        setAutoplayTrailers(
          profile.preferences.autoplayTrailers !== undefined
            ? profile.preferences.autoplayTrailers
            : true
        );
        setAdultFilter(
          profile.preferences.adultFilter !== undefined
            ? profile.preferences.adultFilter
            : false
        );
        setDefaultBoardPublic(
          profile.preferences.defaultBoardPublic !== undefined
            ? profile.preferences.defaultBoardPublic
            : true
        );
        setEmailNotifications(
          profile.preferences.emailNotifications !== undefined
            ? profile.preferences.emailNotifications
            : true
        );
      }
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formattedUsername = username.trim()
        ? `@${username.trim().replace(/^@+/, "").toLowerCase()}`
        : `@user_${profile?.uid.slice(0, 5) || "ren"}`;

      const updatedPrefs: UserPreferences = {
        language,
        soundEffects,
        autoplayTrailers,
        adultFilter,
        defaultBoardPublic,
        emailNotifications,
      };

      await onSaveProfile({
        displayName: displayName.trim() || "Ren",
        username: formattedUsername,
        bio: bio.trim(),
        photoURL: photoURL.trim(),
        isPublic,
        preferences: updatedPrefs,
      });

      if (language !== locale) {
        setLocale(language);
      }

      toast.success("Profile & platform settings saved successfully!");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save settings: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetGoogle = async () => {
    try {
      await onResetGoogleAvatar();
      if (profile?.googlePhotoURL) {
        setPhotoURL(profile.googlePhotoURL);
      }
      toast.success("Reset avatar to your default Google account photo");
    } catch (err) {
      toast.error("Failed to reset to Google avatar");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#141417] border-zinc-800 text-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sliders className="h-5 w-5 text-rose-500" />
            <span>Profile & Platform Settings</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Manage your public identity, privacy visibility, and platform controls.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 bg-zinc-900 border border-zinc-800 p-1 rounded-xl mb-4">
            <TabsTrigger
              value="profile"
              className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-white flex items-center gap-1.5"
            >
              <UserIcon className="h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-white flex items-center gap-1.5"
            >
              <Shield className="h-3.5 w-3.5" />
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value="platform"
              className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-white flex items-center gap-1.5"
            >
              <Sliders className="h-3.5 w-3.5" />
              Platform
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Profile Customization */}
          <TabsContent value="profile" className="space-y-5 focus-visible:outline-none">
            {/* Avatar Section */}
            <div className="space-y-3 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Avatar Photo
              </Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-rose-500/40 shadow-lg">
                  <AvatarImage src={photoURL || undefined} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white font-bold text-xl">
                    {displayName[0]?.toUpperCase() || "R"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 flex-1">
                  <Input
                    placeholder="Custom image URL (https://...)"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-xs h-9"
                  />
                  {profile?.googlePhotoURL && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetGoogle}
                      className="text-xs h-7 border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 gap-1.5"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset to Google Photo
                    </Button>
                  )}
                </div>
              </div>

              {/* Preset Avatars */}
              <div>
                <p className="text-[11px] text-zinc-400 mb-2 font-medium">
                  Or pick a preset anime hero:
                </p>
                <div className="flex gap-2">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setPhotoURL(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                        photoURL === preset.url
                          ? "border-rose-500 scale-105"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      title={preset.name}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={preset.url} alt={preset.name} />
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-xs font-semibold text-zinc-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ren Kisaragi"
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold text-zinc-300">
                  Handle / Username
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">@</span>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                    }
                    placeholder="ren_otaku"
                    className="bg-zinc-900 border-zinc-700 text-white pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-semibold text-zinc-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your favorite genres, anime milestones, or current obsession..."
                rows={3}
                className="bg-zinc-900 border-zinc-700 text-white text-xs resize-none"
              />
            </div>
          </TabsContent>

          {/* TAB 2: Privacy Visibility Controls */}
          <TabsContent value="privacy" className="space-y-4 focus-visible:outline-none">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-amber-400" />
                    )}
                    <Label className="text-sm font-bold text-white">
                      {isPublic ? "Public Profile" : "Private Profile"}
                    </Label>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {isPublic
                      ? "Your profile appears in the Otakuz Homepage community explorer. Other otakus can view your profile, level, rank, and your public saved boards."
                      : "Only you can see your profile details and boards. Hidden from the homepage and discovery directories."}
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-white">
                    Default New Boards to Public
                  </Label>
                  <p className="text-xs text-zinc-400">
                    When creating a new saved board, make it public by default.
                  </p>
                </div>
                <Switch
                  checked={defaultBoardPublic}
                  onCheckedChange={setDefaultBoardPublic}
                  className="data-[state=checked]:bg-rose-500"
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Platform Preferences */}
          <TabsContent value="platform" className="space-y-4 focus-visible:outline-none">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              {/* Language Selection */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-white">
                    Platform Language
                  </Label>
                  <p className="text-xs text-zinc-400">
                    Choose interface language for Otakuz.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={language === "en" ? "default" : "outline"}
                    onClick={() => setLanguage("en")}
                    className={`h-8 text-xs font-bold ${
                      language === "en"
                        ? "bg-rose-500 hover:bg-rose-600 text-white"
                        : "border-zinc-700 text-zinc-300"
                    }`}
                  >
                    English
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={language === "ja" ? "default" : "outline"}
                    onClick={() => setLanguage("ja")}
                    className={`h-8 text-xs font-bold ${
                      language === "ja"
                        ? "bg-rose-500 hover:bg-rose-600 text-white"
                        : "border-zinc-700 text-zinc-300"
                    }`}
                  >
                    日本語
                  </Button>
                </div>
              </div>

              {/* Autoplay Trailers */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-zinc-400" />
                    <Label className="text-sm font-semibold text-white">
                      Autoplay Trailers & Previews
                    </Label>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Automatically play anime PV teasers and trailers when opened.
                  </p>
                </div>
                <Switch
                  checked={autoplayTrailers}
                  onCheckedChange={setAutoplayTrailers}
                  className="data-[state=checked]:bg-rose-500"
                />
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-zinc-400" />
                    <Label className="text-sm font-semibold text-white">
                      Sound Effects & Audio Feedback
                    </Label>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Play anime-inspired audio cues on actions and room messages.
                  </p>
                </div>
                <Switch
                  checked={soundEffects}
                  onCheckedChange={setSoundEffects}
                  className="data-[state=checked]:bg-rose-500"
                />
              </div>

              {/* Adult / Spoiler Filter */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-zinc-400" />
                    <Label className="text-sm font-semibold text-white">
                      Spoiler & Content Filter
                    </Label>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Blur potential plot spoilers and sensitive community content.
                  </p>
                </div>
                <Switch
                  checked={adultFilter}
                  onCheckedChange={setAdultFilter}
                  className="data-[state=checked]:bg-rose-500"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-rose-500 hover:bg-rose-600 text-white font-medium"
          >
            {isSaving ? t("common.loading") : t("profile.saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
