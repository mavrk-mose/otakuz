import { z } from "zod";
import type { UserProfileData } from "@/types/user";

export const profileSettingsSchema = z.object({
  displayName: z.string().trim().max(100, "settings.validationName"),
  username: z.string().trim().regex(/^@*[a-zA-Z0-9_]*$/, "settings.validationUsername"),
  bio: z.string().trim().max(2000, "settings.validationBio"),
  photoURL: z.string().trim().refine(value => value === "" || (/^https?:\/\//i.test(value) && z.string().url().safeParse(value).success), "settings.validationImage"),
  isPublic: z.boolean(), language: z.enum(["en", "ja"]),
  soundEffects: z.boolean(), autoplayTrailers: z.boolean(), adultFilter: z.boolean(),
  defaultBoardPublic: z.boolean(), emailNotifications: z.boolean(),
});
export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;

export function profileSettingsDefaults(profile: UserProfileData | null): ProfileSettingsValues {
  return {
    displayName: profile?.displayName ?? "", username: profile?.username?.replace(/^@/, "") ?? "",
    bio: profile?.bio ?? "", photoURL: profile?.photoURL ?? "", isPublic: profile?.isPublic ?? true,
    language: profile?.preferences?.language ?? "en", soundEffects: profile?.preferences?.soundEffects ?? true,
    autoplayTrailers: profile?.preferences?.autoplayTrailers ?? true, adultFilter: profile?.preferences?.adultFilter ?? false,
    defaultBoardPublic: profile?.preferences?.defaultBoardPublic ?? true, emailNotifications: profile?.preferences?.emailNotifications ?? true,
  };
}
