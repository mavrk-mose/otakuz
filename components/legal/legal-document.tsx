"use client";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, FileText, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useI18n } from "@/components/i18n-provider";
import { LEGAL_UPDATED_AT, LEGAL_SUPPORT_EMAIL, hasConfiguredSupportContact, type LegalDocumentKind } from "@/lib/legal";

type Section = { title: string } & Record<string, string>;
const providerLinks = [
  ["Google / Firebase / YouTube", "https://policies.google.com/privacy"],
  ["Google advertising choices", "https://myadcenter.google.com/"],
  ["Advertising opt-out choices", "https://optout.aboutads.info/"],
  ["Facebook", "https://www.facebook.com/privacy/policy/"],
  ["PostHog", "https://posthog.com/privacy"],
  ["Sanity", "https://www.sanity.io/legal/privacy"],
  ["Vercel", "https://vercel.com/legal/privacy-notice"],
  ["WhatsApp", "https://www.whatsapp.com/legal/privacy-policy"],
];
export function LegalDocument({ kind }: { kind: LegalDocumentKind }) {
  const { locale } = useI18n();
  const t = useTranslations("legal");
  const sections = Object.entries(t.raw(`${kind}.sections`) as Record<string, Section>);
  const Icon = kind === "privacy" ? ShieldCheck : FileText;
  const date = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${LEGAL_UPDATED_AT}T00:00:00Z`));
  return <div className="mx-auto max-w-6xl px-2 py-6 sm:px-6 sm:py-10">
    <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden="true" className="h-4 w-4" />{t("home")}</Link>
    <header className="rounded-3xl border bg-card p-6 sm:p-10">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"><Icon aria-hidden="true" className="h-5 w-5 text-primary" /><span>Otakuz · {t("label")}</span>{!hasConfiguredSupportContact && <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">{t("draft")}</span>}</div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{t(`${kind}.title`)}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{t(`${kind}.intro`)}</p>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays aria-hidden="true" className="h-4 w-4" />{t("updated", { date })}</p>
      <nav aria-label={t("label")} className="mt-6 flex flex-wrap gap-2">{(["terms", "privacy"] as const).map(page => <Link key={page} href={`/${page}`} aria-current={kind === page ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm transition-colors ${kind === page ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-muted"}`}>{t(`${page}.title`)}</Link>)}</nav>
    </header>
    {!hasConfiguredSupportContact && <aside role="note" className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><p className="font-semibold">{t("placeholderTitle")}</p><p className="mt-2 break-words leading-relaxed text-muted-foreground">{t("placeholderBody", { email: LEGAL_SUPPORT_EMAIL })}</p></aside>}
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
      <nav aria-label={t("contents")} className="rounded-2xl border bg-card p-5 lg:sticky lg:top-24"><h2 className="mb-3 text-sm font-semibold">{t("contents")}</h2><ol className="space-y-2.5 text-sm text-muted-foreground">{sections.map(([id, section], index) => <li key={id}><a href={`#${id}`} className="hover:text-primary">{index + 1}. {section.title}</a></li>)}<li><a href="#contact" className="hover:text-primary">{t("contactTitle")}</a></li></ol></nav>
      <article className="min-w-0 space-y-8">{sections.map(([id, section], index) => <section key={id} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 border-b pb-8"><h2 id={`${id}-heading`} className="text-lg font-semibold tracking-tight sm:text-xl"><span className="mr-2 text-primary">{String(index + 1).padStart(2, "0")}</span>{section.title}</h2><div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">{Object.keys(section).filter(key => key.startsWith("p")).map(key => <p key={key}>{t(`${kind}.sections.${id}.${key}`)}</p>)}</div>
        {kind === "privacy" && id === "providers" && <nav aria-label={t("providerLinks")} className="mt-5 flex flex-wrap gap-3">{providerLinks.map(([name, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-4">{name}<ArrowUpRight aria-hidden="true" className="h-3 w-3" /></a>)}</nav>}
      </section>)}
      <section id="contact" aria-labelledby="legal-contact-heading" className="scroll-mt-24 rounded-2xl border bg-card p-5 sm:p-6"><h2 id="legal-contact-heading" className="text-lg font-semibold">{t("contactTitle")}</h2><p className="mt-3 break-words text-sm leading-7 text-muted-foreground">{t(hasConfiguredSupportContact ? "contactBody" : "placeholderBody", { email: LEGAL_SUPPORT_EMAIL })}</p>{hasConfiguredSupportContact && <a href={`mailto:${LEGAL_SUPPORT_EMAIL}`} className="mt-3 inline-flex text-sm text-primary underline">{LEGAL_SUPPORT_EMAIL}</a>}</section>
      <p className="text-xs leading-relaxed text-muted-foreground">{t("languageNote")}</p>
      </article>
    </div>
  </div>;
}
