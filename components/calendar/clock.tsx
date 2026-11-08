"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { enUS, ja } from "date-fns/locale";
import { useI18n } from "@/components/i18n-provider";

export function RealtimeClock() {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ja" ? ja : enUS;
  // The server and browser must render the same initial value. Reading the
  // current time during render can differ by a second (or by timezone), which
  // causes React to discard the server-rendered tree during hydration.
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date());

    updateTime();
    const timer = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const getGMTOffset = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);
    const sign = offset <= 0 ? "+" : "-";

    return `${sign}${hours.toString().padStart(2, "0")}${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="rounded-full bg-card px-4 py-2 font-mono text-sm"
      aria-label={
        time
          ? t("calendar.currentTime", { time: format(time, "PPpp", { locale: dateLocale }) })
          : t("calendar.loadingTime")
      }
    >
      {time
        ? `(GMT${getGMTOffset(time)}) ${format(time, locale === "ja" ? "yyyy年M月d日 HH:mm:ss" : "dd/MM/yyyy HH:mm:ss", { locale: dateLocale })}`
        : "(GMT----) --/--/---- --:--:--"}
    </div>
  );
}
