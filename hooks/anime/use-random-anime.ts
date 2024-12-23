"use client"

import {useQuery} from "@tanstack/react-query";
import {API_BASE_URL} from "@/lib/api";
import {AnimeDetails} from "@/types/anime";

const useRandomAnime = () => {
    return useQuery<AnimeDetails>({
        queryKey: ['random'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/random/anime`);
            if (!response.ok) throw new Error('Failed to fetch anime details');
            const data = await response.json();
            return data.data;
        },
        staleTime: Infinity
    });
}

export default useRandomAnime;