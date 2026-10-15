import { useMediaPictures } from "@/hooks/use-media";
import { AnimeDetails } from "@/types/anime";

export function useAnimePictures(id: string) {
    return useMediaPictures<AnimeDetails["images"]>("anime", id);
}
