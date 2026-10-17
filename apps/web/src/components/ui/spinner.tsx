import type { ComponentProps } from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "cn";

type SpinnerProps = Omit<ComponentProps<typeof Loader2Icon>, "aria-hidden"> & {
  label?: string;
  showLabel?: boolean;
};

export function Spinner({
  label = "Loading",
  showLabel = false,
  className,
  ...iconProps
}: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <Loader2Icon
        {...iconProps}
        aria-hidden="true"
        className={cn("size-4 animate-spin", className)}
      />
      <span className={showLabel ? undefined : "sr-only"}>{label}</span>
    </span>
  );
}
