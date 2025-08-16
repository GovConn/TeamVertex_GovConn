"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ---- helpers ----
const pad = (n: number) => n.toString().padStart(2, "0");

const formatLabel = (value: string, use12Hour: boolean) => {
  if (!value) return "";
  const [h, m] = value.split(":").map(Number);
  if (!use12Hour) return `${pad(h)}:${pad(m)}`;        // 24h display
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(m)} ${ampm}`;              // 12h display
};

const toMinutes = (hhmm: string) => {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};

const clampToWindow = (value: string, min?: string, max?: string) => {
  if (min && toMinutes(value) < toMinutes(min)) return min;
  if (max && toMinutes(value) > toMinutes(max)) return max;
  return value;
};

function partsFromValue(value: string, use12Hour: boolean) {
  const [hStr = "00", mStr = "00"] = (value || "").split(":");
  const h = Number(hStr);
  const m = Number(mStr);

  if (!use12Hour) return { hour24: h, minute: m, ampm: "AM" as "AM" | "PM" };

  const ampm: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute: m, ampm };
}

function valueFromParts(parts: { hour24?: number; hour12?: number; minute: number; ampm?: "AM" | "PM" }, use12Hour: boolean) {
  if (!use12Hour) {
    const h = parts.hour24 ?? 0;
    return `${pad(h)}:${pad(parts.minute)}`;
  }
  const h12 = parts.hour12 ?? 12;
  const base = h12 % 12;
  const h24 = parts.ampm === "PM" ? base + 12 : base;
  return `${pad(h24)}:${pad(parts.minute)}`;
}

export type TimePickerProps = {
  value: string;                  // "HH:MM"
  onChange: (value: string) => void;
  placeholder?: string;           // shown on button when no value
  minuteStep?: number;            // default 5
  use12Hour?: boolean;            // default true
  min?: string;                   // optional "HH:MM"
  max?: string;                   // optional "HH:MM"
  className?: string;
  buttonClassName?: string;
};

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  minuteStep = 5,
  use12Hour = true,
  min,
  max,
  className,
  buttonClassName,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const minutes = React.useMemo(
    () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep),
    [minuteStep],
  );

  const hours = React.useMemo(() => {
    return use12Hour
      ? Array.from({ length: 12 }, (_, i) => (i + 1))     // 1..12
      : Array.from({ length: 24 }, (_, i) => i);           // 0..23
  }, [use12Hour]);

  const parts = partsFromValue(value, use12Hour);
  const label = value ? formatLabel(value, use12Hour) : "";

  function commit(next: string) {
    const clamped = clampToWindow(next, min, max);
    onChange(clamped);
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn("w-full justify-between", buttonClassName)}
          >
            {label || <span className="text-muted-foreground">{placeholder}</span>}
            <Clock className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="grid grid-cols-3 gap-3">
            {/* Hours */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Hour</div>
              <Select
                value={
                  use12Hour
                    ? String(parts.hour12 ?? 12)
                    : String(parts.hour24 ?? 0)
                }
                onValueChange={(val) => {
                  if (use12Hour) {
                    const next = valueFromParts(
                      { hour12: Number(val), minute: parts.minute, ampm: parts.ampm },
                      true,
                    );
                    commit(next);
                  } else {
                    const next = valueFromParts(
                      { hour24: Number(val), minute: parts.minute },
                      false,
                    );
                    commit(next);
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {use12Hour ? pad(h) : pad(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Minutes */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Minute</div>
              <Select
                value={String(parts.minute)}
                onValueChange={(val) => {
                  const next = valueFromParts(
                    use12Hour
                      ? { hour12: parts.hour12, minute: Number(val), ampm: parts.ampm }
                      : { hour24: parts.hour24, minute: Number(val) },
                    use12Hour,
                  );
                  commit(next);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {minutes.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {pad(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AM/PM */}
            {use12Hour && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">AM/PM</div>
                <Select
                  value={parts.ampm}
                  onValueChange={(val: "AM" | "PM") => {
                    const next = valueFromParts(
                      { hour12: parts.hour12, minute: parts.minute, ampm: val },
                      true,
                    );
                    commit(next);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {(min || max) && (
            <p className="mt-3 text-xs text-muted-foreground">
              {min && max ? `Allowed: ${min}–${max}` : min ? `Min: ${min}` : `Max: ${max}`}
            </p>
          )}

          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
