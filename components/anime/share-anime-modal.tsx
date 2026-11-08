import React from "react";
import { AnimeDetails } from "@/types/anime";
import { ShareContentModal } from "@/components/chat/share-content-modal";

interface ShareAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: AnimeDetails;
}

export default function ShareAnimeModal({ isOpen, onClose, anime }: ShareAnimeModalProps) {
  if (!anime) return null;

  const payload = {
    type: "anime" as const,
    data: {
      title: anime.title,
      image: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || "",
      id: anime.mal_id,
      score: anime.score,
      type: anime.type,
      episodes: anime.episodes,
    },
  };

  return <ShareContentModal isOpen={isOpen} onClose={onClose} payload={payload} />;
}
