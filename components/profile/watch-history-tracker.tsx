"use client";

import { useRecordWatchHistory } from "@/hooks/use-watch-history";
import type { RecordWatchHistoryInput } from "@/hooks/watch/watch-history";

export function WatchHistoryTracker(props: RecordWatchHistoryInput) {
  useRecordWatchHistory(props);
  return null;
}
