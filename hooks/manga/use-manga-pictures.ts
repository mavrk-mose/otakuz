import { useMediaPictures } from "@/hooks/use-media";
import { Manga } from "@/types/manga";

export function useMangaPictures(id: string) {
    return useMediaPictures<Manga["images"]>("manga", id);
}
