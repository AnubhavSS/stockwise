"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  value,
  onValueChange,
  placeholder = "Search",
  className,
}: SearchInputProps) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{placeholder}</span>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="bg-card pl-8"
      />
    </label>
  );
}
