# Legal pages

- `/terms`: Terms of Use.
- `/privacy`: Privacy Policy.

Both pages use the public service name **Otakuz**, contain English/Japanese text, and share responsive section navigation and cross-links. A compact legal navigation footer is included across the app.

The supplied support address, `support@otakuz.example`, is an explicit sample. It does not represent an operational inbox. The pages display a draft badge and contact notice, omit a `mailto` link for the sample address, and request no indexing while the sample is configured.

To supply a real, controlled support channel, configure `NEXT_PUBLIC_SUPPORT_EMAIL` and rebuild. Configuring an address does not verify mailbox ownership or deliverability; the operator must check that it works. The helper's configured-contact flag only distinguishes the sample address from an explicitly supplied address.

The text reflects the inspected application behavior: Firebase sign-in/storage/chat/push, public profiles and boards, browser caches, PostHog analytics with session recording disabled, AdSense, external video/streams, Google Maps, and WhatsApp order preparation. It does not invent a legal entity, address, governing jurisdiction, fixed retention schedule, payment processor, or functioning account-deletion workflow. The app's actual configuration and operator practices must continue to match the text.

Provider policy links are included on the privacy page. This draft does not establish that requirements in every jurisdiction have been met or introduce a consent-management mechanism.
