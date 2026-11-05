# AdSense setup

The app defaults to the supplied general responsive unit: publisher `ca-pub-8820415871877478`, slot `1252363648`. These public IDs are included in the code, so deployment does not depend on local environment files.

Optional overrides must be set **before building**, then rebuilt and deployed:

- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: the publisher ID (`ca-pub-…`).
- `NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT`: a real responsive Display ad unit's `data-ad-slot` value copied from your AdSense account. `1234567890` is Google's example value and is ignored.

Optional placement overrides use `NEXT_PUBLIC_ADSENSE_SLOT_` followed by:
`HOME_HERO`, `HOME_FEED`, `NEWS_TOP`, `NEWS_FEED`, `NEWS_ARTICLE`, `NEWS_SIDEBAR`,
`EVENTS_TOP`, `EVENTS_BOTTOM`, `EVENTS_TIMELINE`, `EVENTS_SIDEBAR`,
`SHOP_TOP`, `SHOP_FEED`, or `SHOP_SIDEBAR`.
Empty or invalid overrides fall back to the configured default, then the general slot.

The current placements use responsive Display units. The Otakuz placement variant
controls the surrounding site layout; it does not create an AdSense native ad unit.
For an actual native In-feed unit, pass its matching `adLayoutKey` with `adFormat="fluid"`
and the slot ID from that same unit. Without a layout key, the component uses `auto`.

The SDK uses a native asynchronous script in the document head. Pending units stay
mounted until Google reports whether they are filled; partner content remains available
while waiting. Placeholder IDs fall back to the general slot and do not send requests for the example ID.

If requests still show an old slot ID, check the build environment and deploy a new build.
Ad delivery also depends on the site's approval and ad-serving status in AdSense.
The Firebase VAPID key is unrelated to ads.

References: [Google ad placement instructions](https://support.google.com/adsense/answer/9190028),
[In-feed ad code](https://support.google.com/adsense/answer/9189560),
[Next.js public environment variables](https://nextjs.org/docs/app/guides/environment-variables).

Run regression checks with `node --test tests/adsense.test.cjs`.
