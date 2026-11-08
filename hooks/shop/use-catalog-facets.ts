import { useQuery } from "@tanstack/react-query";
import { getCatalogFacets } from "@/lib/sanity";
export function useCatalogFacets() {
  return useQuery({ queryKey: ["catalogFacets"], queryFn: ({ signal }) => getCatalogFacets(signal), staleTime: 5 * 60 * 1000 });
}
