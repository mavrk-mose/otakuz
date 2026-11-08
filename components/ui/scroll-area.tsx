"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
  scrollStep?: number;
  hideControls?: boolean;
  controlSize?: "sm" | "md";
}

interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  canScrollUp: boolean;
  canScrollDown: boolean;
}

const SCROLL_THRESHOLD = 6;

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      viewportClassName,
      scrollStep,
      hideControls = false,
      controlSize = "md",
      children,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const rafRef = React.useRef<number | null>(null);

    const [scrollState, setScrollState] = React.useState<ScrollState>({
      canScrollLeft: false,
      canScrollRight: false,
      canScrollUp: false,
      canScrollDown: false,
    });

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const measureScroll = React.useCallback(() => {
      const el = viewportRef.current;
      if (!el) return;

      const nextLeft = el.scrollLeft > SCROLL_THRESHOLD;
      const nextRight = el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_THRESHOLD;
      const nextUp = el.scrollTop > SCROLL_THRESHOLD;
      const nextDown = el.scrollTop + el.clientHeight < el.scrollHeight - SCROLL_THRESHOLD;

      setScrollState((prev) => {
        if (
          prev.canScrollLeft === nextLeft &&
          prev.canScrollRight === nextRight &&
          prev.canScrollUp === nextUp &&
          prev.canScrollDown === nextDown
        ) {
          return prev;
        }
        return {
          canScrollLeft: nextLeft,
          canScrollRight: nextRight,
          canScrollUp: nextUp,
          canScrollDown: nextDown,
        };
      });
    }, []);

    const scheduleMeasure = React.useCallback(() => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        measureScroll();
      });
    }, [measureScroll]);

    React.useEffect(() => {
      const el = viewportRef.current;
      if (!el) return;

      measureScroll();

      el.addEventListener("scroll", scheduleMeasure, { passive: true });
      window.addEventListener("resize", scheduleMeasure, { passive: true });

      const resizeObserver =
        typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleMeasure) : null;

      if (resizeObserver) {
        resizeObserver.observe(el);
        Array.from(el.children).forEach((child) => resizeObserver.observe(child));
      }

      const mutationObserver =
        typeof MutationObserver !== "undefined"
          ? new MutationObserver(() => {
              if (resizeObserver) {
                Array.from(el.children).forEach((child) => resizeObserver.observe(child));
              }
              scheduleMeasure();
            })
          : null;

      mutationObserver?.observe(el, { childList: true, subtree: true });

      return () => {
        el.removeEventListener("scroll", scheduleMeasure);
        window.removeEventListener("resize", scheduleMeasure);
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        if (rafRef.current !== null) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }, [measureScroll, scheduleMeasure]);

    const scrollHorizontal = (direction: "left" | "right", e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = viewportRef.current;
      if (!el) return;
      const step = scrollStep ?? Math.max(220, Math.round(el.clientWidth * 0.72));
      el.scrollBy({
        left: direction === "left" ? -step : step,
        behavior: "smooth",
      });
    };

    const scrollVertical = (direction: "up" | "down", e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = viewportRef.current;
      if (!el) return;
      const step = scrollStep ?? Math.max(180, Math.round(el.clientHeight * 0.7));
      el.scrollBy({
        top: direction === "up" ? -step : step,
        behavior: "smooth",
      });
    };

    const horizontalBtnClasses = cn(
      "absolute top-1/2 z-30 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-primary/60 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      controlSize === "sm" ? "h-7 w-7" : "h-9 w-9",
    );

    const verticalBtnClasses = cn(
      "absolute right-2.5 z-30 inline-flex items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-primary/60 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      controlSize === "sm" ? "h-6 w-6" : "h-8 w-8",
    );

    const iconClasses = controlSize === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

    return (
      <div
        ref={setRefs}
        className={cn("group/scroll relative min-w-0 max-w-full overflow-hidden", className)}
        {...props}
      >
        <div
          ref={viewportRef}
          data-radix-scroll-area-viewport=""
          className={cn(
            "h-full max-h-[inherit] w-full min-w-0 max-w-full overflow-auto rounded-[inherit] scrollbar-none",
            viewportClassName,
          )}
        >
          {children}
        </div>

        {!hideControls && scrollState.canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left"
            title="Scroll left"
            onClick={(e) => scrollHorizontal("left", e)}
            className={cn(horizontalBtnClasses, "left-2")}
          >
            <ChevronLeft className={iconClasses} />
          </button>
        )}

        {!hideControls && scrollState.canScrollRight && (
          <button
            type="button"
            aria-label="Scroll right"
            title="Scroll right"
            onClick={(e) => scrollHorizontal("right", e)}
            className={cn(horizontalBtnClasses, "right-2")}
          >
            <ChevronRight className={iconClasses} />
          </button>
        )}

        {!hideControls && scrollState.canScrollUp && (
          <button
            type="button"
            aria-label="Scroll up"
            title="Scroll up"
            onClick={(e) => scrollVertical("up", e)}
            className={cn(verticalBtnClasses, "top-2")}
          >
            <ChevronUp className={iconClasses} />
          </button>
        )}

        {!hideControls && scrollState.canScrollDown && (
          <button
            type="button"
            aria-label="Scroll down"
            title="Scroll down"
            onClick={(e) => scrollVertical("down", e)}
            className={cn(verticalBtnClasses, "bottom-2")}
          >
            <ChevronDown className={iconClasses} />
          </button>
        )}
      </div>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

export interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>((_props, _ref) => null);
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
