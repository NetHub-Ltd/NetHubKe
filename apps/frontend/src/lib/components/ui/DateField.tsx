"use client";

import { useId, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Calendar, toISODate } from "./Calendar";
import { Input } from "./Input";
import { Field } from "./Field";
import { Button } from "./Button";

export type DateFieldProps = {
  label?: string;
  value?: string; // YYYY-MM-DD
  onChange?: (iso: string) => void;
  required?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  name?: string;
};

/**
 * Text input + popover calendar. Value is ISO date string for forms.
 */
export function DateField({
  label = "Date",
  value = "",
  onChange,
  required,
  error,
  minDate,
  maxDate,
  className,
  name,
}: DateFieldProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + "T12:00:00") : null;

  return (
    <Field
      label={label}
      htmlFor={id}
      required={required}
      error={error}
      className={className}
    >
      <div className="relative">
        <Input
          id={id}
          name={name}
          type="date"
          value={value}
          required={required}
          invalid={Boolean(error)}
          onChange={(e) => onChange?.(e.target.value)}
          className="pr-12"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          aria-expanded={open}
          aria-label="Toggle calendar"
          onClick={() => setOpen((o) => !o)}
          leftIcon={<CalendarIcon className="h-4 w-4" />}
        />
        {open ? (
          <div className="absolute z-20 mt-space-xs w-[min(100%,20rem)]">
            <Calendar
              value={selected}
              minDate={minDate}
              maxDate={maxDate}
              onChange={(d) => {
                onChange?.(toISODate(d));
                setOpen(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </Field>
  );
}
