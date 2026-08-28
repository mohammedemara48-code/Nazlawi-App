import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-[0_1px_2px_color-mix(in_oklab,var(--color-ink)_6%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}
