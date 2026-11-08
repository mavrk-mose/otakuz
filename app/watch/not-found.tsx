"use client";

import { MissingPage } from "@/components/page-state";
import { useI18n } from "@/components/i18n-provider";

export default function NotFound() {
  const { t } = useI18n();
  return <MissingPage title={t("watch.notFound")} description={t("watch.notFoundDescription")} />;
}
