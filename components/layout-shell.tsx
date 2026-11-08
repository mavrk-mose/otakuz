"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const isExpanded = useSidebarStore((state) => state.isExpanded);

  return (
    <div
      className={cn(
        "min-h-screen min-w-0 max-w-full overflow-x-clip transition-[padding-left] duration-300 ease-in-out",
        isExpanded ? "lg:pl-[240px]" : "lg:pl-[72px]",
      )}
    >
      {children}
    </div>
  );
}
