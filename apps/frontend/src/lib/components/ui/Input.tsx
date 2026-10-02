"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Visual invalid state (pairs with Field error) */
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, type = "text", ...rest }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn("field-control", invalid && "field-invalid", className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    );
  },
);
