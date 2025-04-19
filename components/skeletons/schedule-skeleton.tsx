import type React from "react"
import { cn } from "@/lib/utils"

function ScheduleSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
}

export { ScheduleSkeleton }
