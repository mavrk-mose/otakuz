export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "anime_share";

export type DeliveryStatus = "sending" | "sent" | "error";

export type AnimeShareData = {
  title: string;
  image: string;
  id: string | number;
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
};

export type MessageProps = {
  message: Message;
  currentUserId: string | undefined;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
};
