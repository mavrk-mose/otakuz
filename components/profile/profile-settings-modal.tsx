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
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
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

export function ProfileSettingsModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetGoogleAvatar,
}: ProfileSettingsModalProps) {
  const { t, locale, setLocale } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();

  // Dynamic avatars fetched from API
  const [apiAvatars, setApiAvatars] = useState<{ name: string; url: string }[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingAvatars(true);
      fetch("/api/jikan/top/characters?limit=6")
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            const mapped = data.data
              .map((c: any) => ({
                name: c.name || "Hero",
                url: c.images?.webp?.image_url || c.images?.jpg?.image_url || "",
              }))
              .filter((c: any) => Boolean(c.url));
            setApiAvatars(mapped);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch character avatars from API:", err);
        })
        .finally(() => setLoadingAvatars(false));
    }
  }, [isOpen]);

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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border text-card-foreground p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sliders className="h-5 w-5 text-rose-500" />
            <span>Profile & Platform Settings</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Manage your public identity, privacy visibility, and platform controls.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 bg-muted/60 border border-border p-1 rounded-xl mb-4">
            <TabsTrigger
              value="profile"
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-1.5"
            >
              <UserIcon className="h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-1.5"
            >
              <Shield className="h-3.5 w-3.5" />
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value="platform"
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-1.5"
            >
              <Sliders className="h-3.5 w-3.5" />
              Platform
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Profile Customization */}
          <TabsContent value="profile" className="space-y-5 focus-visible:outline-none">
            {/* Avatar Section */}
            <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                    className="bg-card border-border text-foreground text-xs h-9"
                  />
                  {profile?.googlePhotoURL && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetGoogle}
                      className="text-xs h-7 border-border bg-muted hover:bg-muted/80 text-foreground gap-1.5"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset to Google Photo
                    </Button>
                  )}
                </div>
              </div>

              {/* API Avatars */}
              {apiAvatars.length > 0 && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-2 font-medium">
                    Or choose from popular anime characters (Jikan API):
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {apiAvatars.map((hero) => (
                      <button
                        key={hero.url}
                        type="button"
                        onClick={() => setPhotoURL(hero.url)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 flex-shrink-0 ${
                          photoURL === hero.url
                            ? "border-rose-500 scale-105"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        title={hero.name}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={hero.url} alt={hero.name} />
                          <AvatarFallback className="text-[10px]">
                            {hero.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Display Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-xs font-semibold text-foreground">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ren Kisaragi"
                  className="bg-card border-border text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold text-foreground">
                  Handle / Username
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">@</span>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                    }
                    placeholder="ren_otaku"
                    className="bg-card border-border text-foreground pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-semibold text-foreground">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your favorite genres, anime milestones, or current obsession..."
                rows={3}
                className="bg-card border-border text-foreground text-xs resize-none"
              />
            </div>
          </TabsContent>

          {/* TAB 2: Privacy Visibility Controls */}
          <TabsContent value="privacy" className="space-y-4 focus-visible:outline-none">
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-amber-500" />
                    )}
                    <Label className="text-sm font-bold text-foreground">
                      {isPublic ? "Public Profile" : "Private Profile"}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
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

              <div className="pt-3 border-t border-border flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-foreground">
                    Default New Boards to Public
                  </Label>
                  <p className="text-xs text-muted-foreground">
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
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
              {/* Theme Appearance Mode */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <Label className="text-sm font-semibold text-foreground">
                      Theme Appearance
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose between Warm Creamy light mode and Slate Dark mode.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={resolvedTheme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className={`h-8 text-xs font-bold gap-1.5 ${
                      resolvedTheme === "light"
                        ? "bg-rose-500 hover:bg-rose-600 text-white"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    Creamy
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={resolvedTheme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className={`h-8 text-xs font-bold gap-1.5 ${
                      resolvedTheme === "dark"
                        ? "bg-rose-500 hover:bg-rose-600 text-white"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5 text-rose-400" />
                    Slate Dark
                  </Button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground">
                    Platform Language
                  </Label>
                  <p className="text-xs text-muted-foreground">
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
                        : "border-border text-foreground hover:bg-muted"
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
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    日本語
                  </Button>
                </div>
              </div>

              {/* Autoplay Trailers */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold text-foreground">
                      Autoplay Trailers & Previews
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold text-foreground">
                      Sound Effects & Audio Feedback
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold text-foreground">
                      Spoiler & Content Filter
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
            className="border-border text-foreground hover:bg-muted"
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
