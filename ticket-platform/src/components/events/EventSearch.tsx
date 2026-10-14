"use client";

import { EventSearchBox } from "@/components/events/EventSearchBox";

interface EventSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function EventSearch({ value, onChange }: EventSearchProps) {
  return (
    <EventSearchBox
      value={value}
      onChange={onChange}
      inputClassName="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-900 shadow-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  );
}
