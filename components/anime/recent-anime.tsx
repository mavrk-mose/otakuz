import { Card } from "../ui/card";
import Image from 'next/image'

const RecentAnime = ({
    animeData,
    setSelectedVideo,
}: {
    animeData: any;
    setSelectedVideo: (anime: any) => void;
}) => (
    <>
        {animeData.entry.map((anime: any, idx: number) => (
            <Card
                key={idx}
                className="flex items-center space-x-2 p-2 bg-[#26262C] hover:bg-[#3A3A3D] cursor-pointer"
                onClick={() => setSelectedVideo(anime)}
            >
                <div className="relative aspect-[2/3]">
                    <Image
                        src={anime.images.jpg.large_image_url}
                        alt={anime.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div>
                        <h3 className="text-sm font-medium line-clamp-1">{anime.title}</h3>
                        <p className="text-xs text-[#ADADB8]">{animeData.user.username}</p>
                    </div>
                </div>
            </Card>
        ))}
    </>
);

export default RecentAnime;