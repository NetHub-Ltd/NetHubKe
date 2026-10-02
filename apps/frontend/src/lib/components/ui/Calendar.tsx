"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type CalendarProps = {
  /** Controlled selected date (local midnight semantics) */
  value?: Date | null;
  onChange?: (date: Date) => void;
  /** Earliest selectable day */
  minDate?: Date;
  maxDate?: Date;
  className?: string;
};

/**
 * Month grid calendar. Theme tokens only — no third-party date picker.
 */
export function Calendar({
  value = null,
  onChange,
  minDate,
  maxDate,
  className,
}: CalendarProps) {
  const initial = value ?? new Date();
  const [cursor, setCursor] = useState(() => startOfMonth(initial));

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const total = daysInMonth(cursor);
    const startPad = first.getDay();
    const out: Array<{ date: Date; inMonth: boolean } | null> = [];
    for (let i = 0; i < startPad; i++) out.push(null);
    for (let day = 1; day <= total; day++) {
      out.push({
        date: new Date(cursor.getFullYear(), cursor.getMonth(), day),
        inMonth: true,
      });
    }
    return out;
  }, [cursor]);

  const monthLabel = cursor.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const isDisabled = (d: Date) => {
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()))
      return true;
    if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()))
      return true;
    return false;
  };

  return (
    <div className={cn("calendar-root card-surface p-space-md", className)}>
      <div className="mb-space-md flex items-center justify-between gap-space-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Previous month"
          onClick={() =>
            setCursor(
              new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
            )
          }
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        />
        <p className="font-label-md text-on-surface">{monthLabel}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Next month"
          onClick={() =>
            setCursor(
              new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
            )
          }
          leftIcon={<ChevronRight className="h-4 w-4" />}
        />
      </div>
      <div className="calendar-grid mb-space-xs grid grid-cols-7 gap-space-2xs text-center">
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            className="font-label-sm py-space-2xs text-on-surface-variant"
          >
            {w}
          </span>
        ))}
        {cells.map((cell, i) => {
          if (!cell) {
            return <span key={`e-${i}`} className="h-9" />;
          }
          const selected = value ? sameDay(cell.date, value) : false;
          const disabled = isDisabled(cell.date);
          const today = sameDay(cell.date, new Date());
          return (
            <button
              key={toISODate(cell.date)}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={toISODate(cell.date)}
              className={cn(
                "calendar-day font-body-sm h-9 w-full rounded-md transition-colors",
                selected && "calendar-day-selected",
                !selected && today && "calendar-day-today",
                !selected && !disabled && "hover:bg-primary-muted",
                disabled && "opacity-40 cursor-not-allowed",
              )}
              onClick={() => onChange?.(cell.date)}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { toISODate };
