"use client";
import { I18nText } from "@/components/i18n-text";
import { useI18n } from "@/components/i18n-provider";


import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { t: localizedT } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-full border border-border/60 bg-muted/40 ${className || ""}`}
        aria-label={localizedT("nav.themeLabel")}
      >
        <div className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={showLabel ? "default" : "icon"}
            onClick={toggleTheme}
            className={`relative rounded-full border border-border/60 bg-card hover:bg-muted text-foreground transition-all duration-300 shadow-sm ${
              showLabel ? "px-3 gap-2 h-9" : "h-9 w-9"
            } ${className || ""}`}
            aria-label={isDark ? "Switch to Creamy theme" : "Switch to Dark theme"}
          >
            <div className="relative flex items-center justify-center">
              <Sun
                className={`h-4 w-4 text-amber-500 transition-all duration-300 ${
                  isDark
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <Moon
                className={`h-4 w-4 text-rose-400 absolute transition-all duration-300 ${
                  isDark
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </div>
            {showLabel && (
              <span className="text-xs font-semibold">
                {isDark ? "Creamy Mode" : "Dark Mode"}
              </span>
            )}
            <span className="sr-only"><I18nText message="nav.themeLabel" /></span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs font-medium">
          {isDark ? "Switch to Creamy theme" : "Switch to Slate Dark theme"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
