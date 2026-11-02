"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronsUp } from "lucide-react";

const TOP_JUMP_THRESHOLD = 450;
const EDGE_THRESHOLD = 32;

export function BackToTopButton() {
  const pathname = usePathname();
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [showJumpTop, setShowJumpTop] = useState(false);
  const rafRef = useRef<number | null>(null);

  const measureWindowScroll = useCallback(() => {
    if (typeof window === "undefined") return;
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0
    );

    setCanScrollUp(scrollY > EDGE_THRESHOLD);
    setCanScrollDown(scrollY + viewportHeight < docHeight - EDGE_THRESHOLD);
    setShowJumpTop(scrollY > TOP_JUMP_THRESHOLD);
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      measureWindowScroll();
    });
  }, [measureWindowScroll]);

  useEffect(() => {
    measureWindowScroll();

    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleMeasure)
        : null;

    if (resizeObserver && document.body) {
      resizeObserver.observe(document.body);
      resizeObserver.observe(document.documentElement);
    }

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      resizeObserver?.disconnect();
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [measureWindowScroll, scheduleMeasure, pathname]);

  const scrollStep = (direction: "up" | "down") => {
    const step = Math.max(280, Math.round(window.innerHeight * 0.75));
    window.scrollBy({
      top: direction === "up" ? -step : step,
      behavior: "smooth",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const hasAnyControl = canScrollUp || canScrollDown;

  return (
    <AnimatePresence>
      {hasAnyControl ? (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.94 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-20 right-4 z-[90] flex flex-col items-center gap-1.5 rounded-full border border-border bg-card/90 p-1.5 shadow-xl backdrop-blur-md lg:bottom-6 lg:right-6"
        >
          {showJumpTop && (
            <button
              type="button"
              aria-label="Scroll to top"
              title="Back to top"
              onClick={scrollToTop}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronsUp className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {canScrollUp && (
            <button
              type="button"
              aria-label="Scroll page up"
              title="Scroll up"
              onClick={() => scrollStep("up")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {canScrollDown && (
            <button
              type="button"
              aria-label="Scroll page down"
              title="Scroll down"
              onClick={() => scrollStep("down")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
