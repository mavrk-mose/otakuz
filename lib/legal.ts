export const LEGAL_UPDATED_AT = "2026-11-08";
export const LEGAL_SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@otakuz.example";
export const hasConfiguredSupportContact = !LEGAL_SUPPORT_EMAIL.endsWith(".example");
export type LegalDocumentKind = "terms" | "privacy";
