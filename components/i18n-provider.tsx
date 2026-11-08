"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import { messages, type Locale, type MessageKey } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "otakuz-locale";
type LocaleControls = { setLocale: (locale: Locale) => void; toggleLocale: () => void };
const LocaleContext = createContext<LocaleControls | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    try { window.localStorage.setItem(LOCALE_STORAGE_KEY, next); } catch { /* Locale still works when storage is blocked. */ }
  }, []);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(LOCALE_STORAGE_KEY); } catch { /* Use browser preference. */ }
    const next = saved === "en" || saved === "ja" ? saved : navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
    setLocaleState(next);
    document.documentElement.lang = next;
  }, []);
  const toggleLocale = useCallback(() => setLocale(locale === "en" ? "ja" : "en"), [locale, setLocale]);
  const controls = useMemo(() => ({ setLocale, toggleLocale }), [setLocale, toggleLocale]);
  return <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
    <LocaleContext.Provider value={controls}>{children}</LocaleContext.Provider>
  </NextIntlClientProvider>;
}

/** Compatibility facade keeps existing callers typed while next-intl handles messages. */
export function useI18n() {
  const controls = useContext(LocaleContext);
  const locale = useLocale() as Locale;
  const translator = useTranslations();
  const t = useCallback((key: MessageKey, values?: Record<string, string | number>) => translator(key, values), [translator]);
  if (!controls) throw new Error("useI18n must be used within I18nProvider");
  return { locale, t, ...controls };
}
