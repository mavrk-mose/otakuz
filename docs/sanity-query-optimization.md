# Sanity list-query optimization

Products, events, news feeds, and title cards now use bounded Sanity queries instead of downloading full document lists for browser filtering and ordering.

## Query behavior

- Product category/title matching, keyword search, stock availability, price ranges/buckets, ordering, and matching counts run in GROQ.
- Cursor pagination uses the selected sort value plus document ID as a deterministic tiebreaker. Each request fetches one extra row to determine whether another page exists; only that bounded lookahead row is removed locally.
- Catalogue categories, title options, and price bounds are queried separately. These small filter metadata lists describe the whole catalogue, so they remain complete when only one product page has loaded.
- Event queries filter upcoming/past views and sort them appropriately. List views receive five attendee previews plus the full attendee count; event detail queries retain complete detail data.
- CMS global search requests matching, ranked, bounded product/event results directly. Firestore/community and channel search remain separate sources.
- News category filtering, chronological paging, featured selection, trending ranking, podcast selection, and investigation selection run in GROQ. The list projection bounds article-body fallback previews to 60 words. Complete article bodies remain in the single-article query.
- Title banners load bounded cursor pages. Homepage product/event sections request only their displayed count.
- Browser query state remains managed by nuqs. New paginated cache keys are persisted, event registration invalidates the new event keys, and product details can initialize from already loaded product pages.

Search and filter values are parameters. Sort expressions come from a fixed set, and list page sizes are bounded. Published list queries exclude draft documents. The storefront excludes products without a valid nonnegative price.

The existing small, local editorial fallback is still available when the remote news catalogue is unavailable. Its local selection does not download a Sanity dataset.

## Verification

- The application test suite includes GROQ execution against fixture datasets through `groq-js`, covering filters/counts, all product sorts, tied-value cursors, search beyond the first page, global facets, price buckets, event periods, attendee previews, title pages, and news categories/highlights.
- Read-only checks against the configured Sanity dataset verified products, events, filter metadata, news, news highlights, title pages, and product cursor boundaries for all four storefront sort modes.
- TypeScript, lint, and the production build check application integration. Two existing hook-dependency warnings remain in unrelated profile/history hooks.

References: [Sanity pagination guidance](https://www.sanity.io/docs/developer-guides/paginating-with-groq), [high-performance GROQ](https://www.sanity.io/docs/developer-guides/high-performance-groq).
