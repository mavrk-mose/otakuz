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
        <Card className="flex items-center space-x-2 p-2 bg-[#26262C] hover:bg-[#3A3A3D] cursor-pointer">
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
            <p className="text-xs text-[#ADADB8] truncate">{animeData.user.username}</p>
          </div>
        </Card>
      </Link>
    ))}
  </>
);

export default RecentAnime;
