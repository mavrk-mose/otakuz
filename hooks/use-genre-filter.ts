"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** The URL is the source of truth, including refreshes and browser history. */
export function useGenreFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get("genre");
  const genre = value && /^[1-9]\d*$/.test(value) ? value : undefined;

  const setGenre = (nextGenre: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextGenre) params.set("genre", nextGenre);
    else params.delete("genre");
    params.delete("page");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}${window.location.hash}`, { scroll: false });
  };

  return { genre, setGenre };
}
