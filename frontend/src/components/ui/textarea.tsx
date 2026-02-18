import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-base text-slate-100 shadow-xs transition-[color,box-shadow,background-color] outline-none placeholder:text-slate-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-cyan-300 focus-visible:bg-white/10 focus-visible:ring-cyan-400/30 focus-visible:ring-[3px]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
