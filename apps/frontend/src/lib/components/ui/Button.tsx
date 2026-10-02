"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows spinner and disables the control */
  loading?: boolean;
  /** Optional leading icon (hidden while loading) */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Full width */
  fullWidth?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  destructive: "btn-destructive",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn-size-sm",
  md: "btn-size-md",
  lg: "btn-size-lg",
};

/**
 * Theme-aware button with loading + disabled feedback.
 * Prefer this over ad-hoc `<button className="btn-…">`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const isDisabled = Boolean(disabled || loading);

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          variantClass[variant],
          sizeClass[size],
          fullWidth && "w-full",
          loading && "btn-loading",
          className,
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        {...rest}
      >
        {loading ? (
          <Loader2
            className="btn-spinner h-4 w-4 shrink-0 animate-spin"
            aria-hidden
          />
        ) : (
          leftIcon
        )}
        <span className={cn(loading && "opacity-90")}>{children}</span>
        {!loading ? rightIcon : null}
      </button>
    );
  },
);
