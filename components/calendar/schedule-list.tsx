"use client"

import { motion } from 'framer-motion';
import { AnimeDetails } from '@/types/anime';

interface ScheduleListProps {
    schedules: AnimeDetails[];
}

export function ScheduleList({ schedules }: ScheduleListProps) {
    return (
        <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
        >
            {schedules.map((anime) => (
                <motion.li
                    key={anime.mal_id}
                    className="flex items-center gap-4"
                    whileHover={{ x: 5 }}
                >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div>
                        <p className="font-medium">{anime?.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Episode {anime?.episodes || '?'} • {anime?.duration}
                        </p>
                    </div>
                </motion.li>
            ))}
        </motion.ul>
    );
}