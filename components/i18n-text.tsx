"use client";

import { useI18n } from "@/components/i18n-provider";
import type { MessageKey } from "@/lib/i18n";

export function I18nText({ message, values }: { message: MessageKey; values?: Record<string, string | number> }) {
  const { t } = useI18n();

  return <>{t(message, values)}</>;
}
