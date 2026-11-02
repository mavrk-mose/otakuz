export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "anime_share"
  | "manga_share"
  | "product_share"
  | "event_share"
  | "profile_share";

export type DeliveryStatus = "sending" | "sent" | "error";

export type AnimeShareData = {
  title: string;
  image: string;
  id: string | number;
  score?: number | string;
  type?: string;
  episodes?: number;
};

export type MangaShareData = {
  title: string;
  image: string;
  id: string | number;
  score?: number | string;
  chapters?: number | null;
  authors?: string[];
  genres?: string[];
};

export type ProductShareData = {
  id: string;
  name: string;
  image: string;
  price: number;
  category?: string;
  rating?: number;
  stock?: number;
  description?: string;
};

export type EventShareData = {
  id: string;
  title: string;
  image: string;
  date: string;
  time?: string;
  locationName?: string;
  ticketPrice?: number;
  category?: string;
  attendeesCount?: number;
};

export type ProfileShareData = {
  userId: string;
  displayName: string;
  username: string;
  photoURL?: string;
  level?: number;
  rank?: string;
  watchedCount?: number;
  readingCount?: number;
  totalExp?: string | number;
};

export type Message = {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  type?: MessageType;
  fileUrl?: string;
  fileType?: string;
  deliveryStatus?: DeliveryStatus;
  editedAt?: number;
  animeData?: AnimeShareData;
  mangaData?: MangaShareData;
  productData?: ProductShareData;
  eventData?: EventShareData;
  profileData?: ProfileShareData;
};

export type MessageProps = {
  message: Message;
  currentUserId: string | undefined;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
};
