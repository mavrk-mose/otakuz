import { AnimeEntry } from "@/types/anime";
import { Card } from "../ui/card";
import Image from "next/image";
import Link from "next/link";

interface RecentAnimeProps {
  animeData: {
    entry: AnimeEntry[];
    content: string;
    user: {
      url: string;
      username: string;
    };
  };
}

const RecentAnime = ({ animeData }: RecentAnimeProps) => (
  <>
    {animeData.entry.map((anime: AnimeEntry) => (
      <Link
        key={anime.mal_id}
        href={`/watch/${anime.mal_id}`}
        className="block"
      >
        <Card className="flex cursor-pointer items-center space-x-2 bg-card p-2 transition-colors hover:bg-sidebar-accent">
          <div className="relative w-16 h-24">
            <Image
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              fill
              className="object-cover rounded"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium line-clamp-2">{anime.title}</h3>
            <p className="truncate text-xs text-muted-foreground">{animeData.user.username}</p>
          </div>
        </Card>
      </Link>
    ))}
  </>
);

export default RecentAnime;
