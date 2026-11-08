import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import type { Title } from "@/types/shop";

export function useCatalogFacets() {
  return useQuery({
    queryKey: ["catalogFacets"],
    queryFn: ({ signal }) => getCatalogFacets(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export const catalogFacetsQuery = `{
  "categories": array::unique(
    *[
      _type == "product" &&
      price >= 0 &&
      !(_id in path("drafts.**")) &&
      defined(category)
    ].category
  ) | order(@ asc),
  "titles": *[
    _type == "title" &&
    !(_id in path("drafts.**"))
  ] | order(name asc, _id asc){
    _id,
    name,
    image
  },
  "minPrice": coalesce(
    math::min(
      *[
        _type == "product" &&
        price >= 0 &&
        !(_id in path("drafts.**"))
      ].price
    ),
    0
  ),
  "maxPrice": coalesce(
    math::max(
      *[
        _type == "product" &&
        price >= 0 &&
        !(_id in path("drafts.**"))
      ].price
    ),
    0
  )
}`;

export type CatalogFacets = {
  categories: string[];
  titles: Title[];
  minPrice: number;
  maxPrice: number;
};
export function getCatalogFacets(signal?: AbortSignal) {
  return client.fetch<CatalogFacets>(catalogFacetsQuery, {}, { signal });
}
