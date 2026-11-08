# Otakuz mascot artwork

Generated with the built-in image generation tool using `public/illustrations/otakuz-empty-collection.webp` as the character/style reference. All four images use transparent backgrounds and are optimized to 640px WebP with alpha preserved. The originals remain in the image generation library.

The shared `EmptyState` component applies the existing floating and sparkling CSS animations. Animations only run when the visitor has not requested reduced motion. Text is rendered separately for accessibility and translation.

## Shared generation prompt

Create one square transparent-background web app mascot illustration matching the attached reference character exactly: cheerful chibi boy, spiky warm brown hair, red-orange headband with cream circle emblem, oversized red and cream headphones, red shirt, dark shorts, warm cream/red palette, thick dark-brown hand-drawn outlines and subtle paper texture. Full figure with comfortable transparent margin, no text, no background, no letters. Keep the same character design and illustrative style.

## Scene prompts and destinations

Each generation used the shared prompt followed by its scene prompt below.

- `public/illustrations/otakuz-mascot-chat.webp`: He sits cross-legged smiling and waving hello, with two simple cream speech bubbles with red hearts floating beside him. Welcoming chat loading and empty conversation illustration.
- `public/illustrations/otakuz-mascot-notifications.webp`: He sits peacefully beside a cream bell with a red ribbon, holding an empty cream envelope and smiling softly. Quiet inbox, all caught up, no urgency.
- `public/illustrations/otakuz-mascot-history.webp`: He sits holding a small open cream scrapbook with tiny abstract red play and bookmark symbols, looking curious and ready for a new adventure. Empty watch history illustration.
- `public/illustrations/otakuz-mascot-cart.webp`: He smiles while peeking into a small empty cream and red shopping basket, one hand waving invitingly. Empty shopping cart illustration.

## Placement

- Chat: authentication/loading views on both chat routes, room selection, empty room searches, and empty watch-party listings.
- Notifications: the empty notification dropdown.
- History: the empty watch/activity log, retaining its navigation actions.
- Cart: the empty shopping cart drawer.

Existing schedule, search, collection, error, and not-found mascot artwork remains in use. The obsolete `public/lottie` assets and the `lottie-react`/`lottie-web` dependencies have been removed.
