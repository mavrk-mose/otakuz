"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSettingsSchema,
  profileSettingsDefaults,
  type ProfileSettingsValues,
} from "@/lib/schemas/profile-settings";
import type { MessageKey } from "@/lib/i18n";
import { useCharacterAvatars } from "@/hooks/use-character-avatars";
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
  const { t, locale, setLocale } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();

  const { data: apiAvatars = [], isLoading: loadingAvatars } = useCharacterAvatars(isOpen);
  const form = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: profileSettingsDefaults(profile),
  });
  const {
    reset,
    setValue,
    handleSubmit,
    register,
    formState: { isSubmitting: isSaving, errors },
  } = form;
  const {
    displayName,
    username,
    bio,
    photoURL,
    isPublic,
    language,
    soundEffects,
    autoplayTrailers,
    adultFilter,
    defaultBoardPublic,
    emailNotifications,
  } = form.watch();
  const setUsername = (value: ProfileSettingsValues["username"]) =>
    setValue("username", value, { shouldDirty: true, shouldValidate: true });
  const setPhotoURL = (value: ProfileSettingsValues["photoURL"]) =>
    setValue("photoURL", value, { shouldDirty: true, shouldValidate: true });
  const setIsPublic = (value: ProfileSettingsValues["isPublic"]) =>
    setValue("isPublic", value, { shouldDirty: true, shouldValidate: true });
  const setLanguage = (value: ProfileSettingsValues["language"]) =>
    setValue("language", value, { shouldDirty: true, shouldValidate: true });
  const setSoundEffects = (value: ProfileSettingsValues["soundEffects"]) =>
    setValue("soundEffects", value, { shouldDirty: true, shouldValidate: true });
  const setAutoplayTrailers = (value: ProfileSettingsValues["autoplayTrailers"]) =>
    setValue("autoplayTrailers", value, { shouldDirty: true, shouldValidate: true });
  const setAdultFilter = (value: ProfileSettingsValues["adultFilter"]) =>
    setValue("adultFilter", value, { shouldDirty: true, shouldValidate: true });
  const setDefaultBoardPublic = (value: ProfileSettingsValues["defaultBoardPublic"]) =>
    setValue("defaultBoardPublic", value, { shouldDirty: true, shouldValidate: true });
  const setEmailNotifications = (value: ProfileSettingsValues["emailNotifications"]) =>
    setValue("emailNotifications", value, { shouldDirty: true, shouldValidate: true });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) reset(profileSettingsDefaults(profile));
  }, [profile, isOpen, reset]);

  const handleSave = handleSubmit(
    async ({
      displayName,
      username,
      bio,
      photoURL,
      isPublic,
      language,
      soundEffects,
      autoplayTrailers,
      adultFilter,
      defaultBoardPublic,
      emailNotifications,
    }) => {
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

        toast.success(t("settings.saved"));
        onClose();
      } catch (err: any) {
        console.error(err);
        toast.error(t("settings.saveFailed") + (err.message || t("settings.unknownError")));
      }
    },
  );

  const handleResetGoogle = async () => {
    try {
      await onResetGoogleAvatar();
      if (profile?.googlePhotoURL) {
        setPhotoURL(profile.googlePhotoURL);
      }
      toast.success(t("settings.resetSuccess"));
    } catch (err) {
      toast.error(t("settings.resetFailed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden bg-card border-border text-card-foreground p-6 rounded-2xl shadow-2xl">
        <ScrollArea controlSize="sm" className="max-h-[calc(90vh-3rem)]">
          <form onSubmit={handleSave} noValidate>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Sliders className="h-5 w-5 text-rose-500" />
                <span>
                  <I18nText message="profile.platformSettings" />
                </span>
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
                        placeholder={t("profile.customImage")}
                        {...register("photoURL")}
                        className="bg-card border-border text-foreground text-xs h-9"
                      />
                      <input
                        ref={photoInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        aria-label={t("profile.uploadImage")}
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          const uid = auth.currentUser?.uid;
                          if (!file || !uid || uid !== profile?.uid) return;
                          if (
                            !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
                              file.type,
                            ) ||
                            file.size > 5 * 1024 * 1024
                          ) {
                            toast.error(t("settings.imageValidation"));
                            return;
                          }
                          setUploadingPhoto(true);
                          try {
                            const imageRef = ref(
                              storage,
                              `users/${uid}/avatars/${crypto.randomUUID()}`,
                            );
                            await uploadBytes(imageRef, file, { contentType: file.type });
                            setPhotoURL(await getDownloadURL(imageRef));
                          } catch {
                            toast.error(t("settings.uploadFailed"));
                          } finally {
                            setUploadingPhoto(false);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={uploadingPhoto || isSaving}
                        onClick={() => photoInput.current?.click()}
                      >
                        {uploadingPhoto ? t("settings.uploading") : t("settings.uploadPhoto")}
                      </Button>
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
                      {...register("displayName")}
                      placeholder={t("profile.nameExample")}
                      className="bg-card border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-semibold text-foreground">
                      <I18nText message="settings.username" />
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                        @
                      </span>
                      <Input
                        id="username"
                        {...register("username")}
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
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
                    {...register("bio")}
                    placeholder={t("profile.bioPlaceholder")}
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
                          {isPublic ? t("settings.publicProfile") : t("settings.privateProfile")}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isPublic
                          ? t("settings.publicDescription")
                          : t("settings.privateDescription")}
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

            {Object.keys(errors).length > 0 && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {Object.values(errors)
                  .map((error) => (error?.message ? t(error.message as MessageKey) : ""))
                  .filter(Boolean)
                  .join(" ")}
              </p>
            )}
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
                type="submit"
                disabled={isSaving || uploadingPhoto}
                className="bg-rose-500 hover:bg-rose-600 text-white font-medium"
              >
                {isSaving ? t("common.loading") : t("profile.saveChanges")}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
