"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export function RealtimeClock() {
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

    return `${sign}${hours.toString().padStart(2, "0")}${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className="rounded-full bg-card px-4 py-2 font-mono text-sm"
      aria-label={time ? `Current time ${format(time, "PPpp")}` : "Loading current time"}
    >
      {time
        ? `(GMT${getGMTOffset(time)}) ${format(time, "dd/MM/yyyy HH:mm:ss")}`
        : "(GMT----) --/--/---- --:--:--"}
    </div>
  );
}
