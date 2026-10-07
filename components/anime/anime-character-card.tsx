import Image from "next/image";
import { Card } from "@/components/ui/card";
import type { AnimeCharacter } from "@/types/anime";

interface AnimeCharacterCardProps {
    character: AnimeCharacter;
    voiceLabel: string;
}

export function AnimeCharacterCard({
    character,
    voiceLabel,
}: AnimeCharacterCardProps) {
    const { character: person } = character;
    const voiceActor =
        character.voice_actors.find((voice) => voice.language === "Japanese") ??
        character.voice_actors[0];
    const imageUrl = person.images?.webp?.image_url ?? "/assets/logo.png";

    return (
        <Card className="flex min-w-0 gap-4 overflow-hidden p-3">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                    src={imageUrl}
                    alt={`${person.name} character image`}
                    fill
                    sizes="80px"
                    className="object-cover"
                />
            </div>
            <div className="min-w-0 py-1">
                <h3 className="line-clamp-2 font-semibold">{person.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{character.role}</p>
                {voiceActor && (
                    <p className="mt-3 line-clamp-2 text-sm">
                        <span className="text-muted-foreground">{voiceLabel}: </span>
                        {voiceActor.person.name}
                    </p>
                )}
            </div>
        </Card>
    );
}
