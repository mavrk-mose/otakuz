import type { Metadata } from "next";
import { hasConfiguredSupportContact } from "@/lib/legal";
import { LegalDocument } from "@/components/legal/legal-document";
export const metadata: Metadata = {
  robots: { index: hasConfiguredSupportContact, follow: true },
  title: "Terms of Use | Otakuz",
  description:
    "Rules for using Otakuz, community content, third-party media, merchandise, and event features.",
};
export default function TermsPage() {
  return <LegalDocument kind="terms" />;
}
