import type { Metadata } from "next";
import { hasConfiguredSupportContact } from "@/lib/legal";
import { LegalDocument } from "@/components/legal/legal-document";
export const metadata: Metadata = {
  robots: { index: hasConfiguredSupportContact, follow: true },
  title: "Privacy Policy | Otakuz",
  description:
    "How Otakuz handles account information, community content, browser storage, analytics, advertising, and your privacy choices.",
};
export default function PrivacyPage() {
  return <LegalDocument kind="privacy" />;
}
