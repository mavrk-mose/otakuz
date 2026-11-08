import type { Message } from "@/types/message";

export function messagePreview(message: Message) {
  return (
    message.message ||
    message.animeData?.title ||
    message.mangaData?.title ||
    message.productData?.name ||
    message.eventData?.title ||
    message.profileData?.displayName ||
    ({ image: "Image", video: "Video", audio: "Audio", file: "File" } as Record<string, string>)[
      message.type || ""
    ] ||
    "Shared content"
  ).slice(0, 250);
}
