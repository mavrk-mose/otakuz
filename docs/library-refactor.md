# Shared library migrations

## Changes

- Profile settings uses React Hook Form with a Zod schema, localized validation messages, one reset path, and submission state. Existing username normalization, avatar upload, privacy controls, and preferences remain available.
- Character avatar requests use cached TanStack Query options, cancellation, and response validation.
- next-intl formats messages from separate English and Japanese dictionaries. The existing `useI18n` facade, language toggle, and saved locale preference remain compatible. Routes retain their existing paths.
- nuqs owns browser URL filter updates for genres, shop filters, channels, selected watch videos, and queue advancement. Shared serializers construct genre, profile, channel, shop, and video links. API request query strings and third-party player configuration are ordinary URLs rather than browser application state.
- cmdk owns search item selection, arrows, Ctrl+N/P, Enter, and selected-item scrolling. Custom category shortcuts, recent searches, multi-source results, and opening results in a new tab remain available.
- idb replaces native IndexedDB request/transaction promise wrappers. Database name, version, stores, indexes, keys, account partitioning, and the 100-message limit remain compatible with existing offline data. Pending, failed, and temporary blob messages are not persisted.
- A shared HTTP helper preserves response status and validates JSON with Zod. Catalogue queries share retry rules and cancellation handling. Malformed data and permanent client errors are not retried.
- Global search validates media, channel, CMS, and community source data before matching. Watch-party messages are validated before changing playback state.
- Watch-party connection changes now use React state. Sequence checks prevent slow HTTP refreshes from replacing newer socket state.
- Duplicate search debounce logic and the obsolete persisted genre store were removed.

## Verification

`npm test` runs Node's test runner through tsx. The suite covers:

- Existing offline database compatibility, cross-account isolation, trimming, delivery filtering, and room replacement.
- Profile defaults, invalid input, validated saving, avatar caching, and locale persistence.
- Every migrated translation, matching message keys, and interpolation.
- nuqs filter state/history, query preservation, pagination reset, URL serialization, and typed shop parsers.
- cmdk arrow/Enter selection and modified Enter for opening a new tab.
- API error/retry behavior, nullable catalogue fields, playable-video filtering, CMS search boundaries, and pagination metadata.
- Connection-status rerenders, malformed socket messages, and newer playback-state preservation.

Production build and TypeScript checks validate the application integration. The full-app lint check has two existing hook-dependency warnings in `use-user-profile` and `use-watch-history`; the migrated code introduces no lint errors.

The default test command also runs the 21 existing application checks (ads, hover previews, bookmarks, playback queues, and persisted query state) before the 20 migration checks. Their lightweight mocks were updated for translation imports and reusable query options.

The existing `tests/chat-rules.test.cjs` is an emulator integration suite, separate from the application unit tests. It was not run: it requires `@firebase/rules-unit-testing` plus running Firestore and Storage emulators. No security rules changed in this refactor.
