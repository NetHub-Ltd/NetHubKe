"use client";

import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function Label({
  className,
  required,
  children,
  ...rest
}: LabelProps) {
  return (
    <label className={cn("field-label", className)} {...rest}>
      {children}
      {required ? (
        <span className="text-error" aria-hidden>
          {" "}
          *
        </span>
      ) : null}
    </label>
  );
}
