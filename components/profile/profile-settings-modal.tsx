"use client";

import { I18nText } from "@/components/i18n-text";


import { useState, useEffect, useRef } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";
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
  const { t: localizedT } = useI18n();
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

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

      toast.success(localizedT("settings.saved"));
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(localizedT("settings.saveFailed") + (err.message || localizedT("settings.unknownError")));
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
      toast.success(localizedT("settings.resetSuccess"));
    } catch (err) {
      toast.error(localizedT("settings.resetFailed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden bg-card border-border text-card-foreground p-6 rounded-2xl shadow-2xl">
        <ScrollArea controlSize="sm" className="max-h-[calc(90vh-3rem)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sliders className="h-5 w-5 text-rose-500" />
            <span><I18nText message="profile.platformSettings" /></span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            <I18nText message="settings.description" />
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 bg-muted/60 border border-border p-1 rounded-xl mb-4">
            <TabsTrigger
              value="profile"
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-1.5"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <I18nText message="settings.profile" />
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-1.5"
            >
              <Shield className="h-3.5 w-3.5" />
              <I18nText message="settings.privacy" />
            </TabsTrigger>
            <TabsTrigger
              value="platform"
              className="text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-1.5"
            >
              <Sliders className="h-3.5 w-3.5" />
              <I18nText message="settings.platform" />
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Profile Customization */}
          <TabsContent value="profile" className="space-y-5 focus-visible:outline-none">
            {/* Avatar Section */}
            <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <I18nText message="settings.avatar" />
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
                    placeholder={localizedT("profile.customImage")}
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="bg-card border-border text-foreground text-xs h-9"
                  />
                  <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label={localizedT("profile.uploadImage")} onChange={async event => {
                    const file = event.target.files?.[0]; event.target.value = '';
                    const uid = auth.currentUser?.uid;
                    if (!file || !uid || uid !== profile?.uid) return;
                    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) { toast.error(localizedT("settings.imageValidation")); return; }
                    setUploadingPhoto(true);
                    try {
                      const imageRef = ref(storage, `users/${uid}/avatars/${crypto.randomUUID()}`);
                      await uploadBytes(imageRef, file, { contentType: file.type });
                      setPhotoURL(await getDownloadURL(imageRef));
                    } catch { toast.error(localizedT("settings.uploadFailed")); } finally { setUploadingPhoto(false); }
                  }} />
                  <Button type="button" size="sm" variant="outline" disabled={uploadingPhoto || isSaving} onClick={() => photoInput.current?.click()}>{uploadingPhoto ? localizedT("settings.uploading") : localizedT("settings.uploadPhoto")}</Button>
                  {profile?.googlePhotoURL && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetGoogle}
                      className="text-xs h-7 border-border bg-muted hover:bg-muted/80 text-foreground gap-1.5"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <I18nText message="settings.resetGoogle" />
                    </Button>
                  )}
                </div>
              </div>

              {/* API Avatars */}
              {apiAvatars.length > 0 && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-2 font-medium">
                    <I18nText message="settings.chooseCharacter" />
                  </p>
                  <ScrollArea controlSize="sm" className="w-full">
                    <div className="flex w-max gap-2 py-1">
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
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Display Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-xs font-semibold text-foreground">
                  <I18nText message="settings.displayName" />
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={localizedT("profile.nameExample")}
                  className="bg-card border-border text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold text-foreground">
                  <I18nText message="settings.username" />
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
                <I18nText message="settings.bio" />
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={localizedT("profile.bioPlaceholder")}
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
                      {isPublic ? localizedT("settings.publicProfile") : localizedT("settings.privateProfile")}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isPublic
                      ? localizedT("settings.publicDescription")
                      : localizedT("settings.privateDescription")}
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
                    <I18nText message="settings.defaultPublic" />
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    <I18nText message="settings.defaultPublicDescription" />
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
                      <I18nText message="settings.theme" />
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <I18nText message="settings.themeDescription" />
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
                    <I18nText message="settings.light" />
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
                    <I18nText message="settings.dark" />
                  </Button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-foreground">
                    <I18nText message="settings.language" />
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    <I18nText message="settings.languageDescription" />
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
                    <I18nText message="settings.english" />
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
                      <I18nText message="settings.autoplay" />
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <I18nText message="settings.autoplayDescription" />
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
                      <I18nText message="settings.sound" />
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <I18nText message="settings.soundDescription" />
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
                      <I18nText message="settings.spoilers" />
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <I18nText message="settings.spoilersDescription" />
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
            disabled={isSaving || uploadingPhoto}
            className="bg-rose-500 hover:bg-rose-600 text-white font-medium"
          >
            {isSaving ? t("common.loading") : t("profile.saveChanges")}
          </Button>
        </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
