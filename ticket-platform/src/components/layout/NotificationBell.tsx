"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const { status } = useSession();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { read: boolean }[]) => {
        if (active && Array.isArray(data)) {
          setUnread(data.filter((n) => !n.read).length);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[10px] font-bold text-black">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
