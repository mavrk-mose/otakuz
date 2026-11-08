export interface UserPreferences {
  language: "en" | "ja";
  soundEffects: boolean;
  autoplayTrailers: boolean;
  adultFilter: boolean;
  defaultBoardPublic: boolean;
  emailNotifications: boolean;
}

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string;
  username: string;
  photoURL: string;
  googlePhotoURL?: string | null;
  bio: string;
  isPublic: boolean;
  level: number;
  rank: string;
  totalExp: string | number;
  watchedCount: number;
  readingCount: number;
  boardsCount?: number;
  totalSaved?: number;
  preferences: UserPreferences;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
}
