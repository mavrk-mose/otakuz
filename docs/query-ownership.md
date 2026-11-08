# Query ownership

Feature requests and their queries live with existing hooks. No new hooks were introduced for this reorganization.

- `hooks/events/use-fetch-events.ts`: event filtering, ordering, counts, cursor pages, and list requests.
- `hooks/events/use-register-event.ts`: event registration mutation.
- `hooks/shop/use-fetch-products.ts`: product filtering, ordering, counts, cursor pages, and list requests.
- `hooks/shop/use-catalog-facets.ts`: independent category/title/price facets.
- `hooks/shop/use-fetch-titles.ts`: title cursor queries and requests.
- `hooks/news/use-fetch-news.ts`: news pages, highlights, and article queries. Static editorial fallback data is in the accompanying `fallback-stories.ts`.
- Existing anime/manga hooks own detail/video query options and top-list requests. The existing shared `hooks/use-media.ts` owns generic media list, genre, and picture requests.
- Profile synchronization, watch-history requests, and notification operations are companion modules under `hooks/auth`, `hooks/watch`, and `hooks/notifications`.

Query functions and options can be reused by other consumers without creating another hook or duplicating a request. Query keys, request parameters, validation, cancellation, pagination, cache behavior, and fallback behavior remain unchanged.

`lib` contains reusable infrastructure: Sanity/Firebase client configuration, API configuration and retry policy, validated HTTP transport, schemas, and pure pagination helpers. Service-worker network handling remains in its worker-script generator because it runs in the worker rather than a React hook.
