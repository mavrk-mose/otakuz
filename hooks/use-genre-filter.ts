"use client";

import { useQueryStates, parseAsInteger } from "nuqs";
import { parseAsGenre } from "@/lib/query-state";

export function useGenreFilter() {
  const [{ genre }, setQuery] = useQueryStates(
    { genre: parseAsGenre, page: parseAsInteger },
    { history: "push", scroll: false },
  );
  return {
    genre: genre ?? undefined,
    setGenre: (value: string | undefined) => setQuery({ genre: value ?? null, page: null }),
  };
}
