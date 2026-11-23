"use client";

import { Search } from "lucide-react";
import { type KeyboardEventHandler, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  shortcut?: ReactNode;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
};

export function SearchInput({
  id,
  value,
  onValueChange,
  placeholder = "Search",
  className,
  shortcut,
  onKeyDown,
}: SearchInputProps) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{placeholder}</span>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn("bg-card pl-8", shortcut && "pr-14")}
      />
      {shortcut ? (
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
          {shortcut}
        </span>
      ) : null}
    </label>
  );
}
