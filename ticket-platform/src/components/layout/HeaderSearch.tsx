"use client";

import { EventSearchBox } from "@/components/events/EventSearchBox";

interface HeaderSearchProps {
  onSearch?: () => void;
}

export function HeaderSearch({ onSearch }: HeaderSearchProps) {
  return <EventSearchBox onNavigate={onSearch} />;
}
