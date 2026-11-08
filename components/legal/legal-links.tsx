"use client";
import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
export function LegalLinks() {
  const { t } = useI18n();
  return <nav aria-label={t("footer.legal")} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border px-4 py-5 pb-24 text-xs text-muted-foreground lg:pb-5">
    <span>© {new Date().getFullYear()} Otakuz</span>
    <Link href="/terms" className="hover:text-foreground hover:underline">{t("legal.termsLink")}</Link>
    <Link href="/privacy" className="hover:text-foreground hover:underline">{t("legal.privacyLink")}</Link>
  </nav>;
}
