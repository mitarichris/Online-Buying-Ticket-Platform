"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, CalendarClock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";

interface ReminderNotification {
  id: string;
  eventId: string | null;
  title: string;
  message: string;
  read: boolean;
}

function shownKey(userId: string) {
  return `reminderPopup:${userId}`;
}

function readShown(userId: string): string[] {
  try {
    const raw = localStorage.getItem(shownKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function UpcomingEventPopup() {
  const { status, data: session } = useSession();
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<ReminderNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    let active = true;
    const userId = session.user.id;

    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ReminderNotification[]) => {
        if (!active || !Array.isArray(data)) return;
        const reminderNotifications = data.filter(
          (n) => n.eventId && typeof n.title === "string" && n.title.startsWith("Reminder:")
        );
        const shown = readShown(userId);
        const fresh = reminderNotifications.filter((n) => !shown.includes(n.id));
        if (fresh.length > 0) {
          setReminders(fresh);
          setOpen(true);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [status, session?.user?.id]);

  function dismiss() {
    if (session?.user?.id) {
      const merged = Array.from(
        new Set([...readShown(session.user.id), ...reminders.map((r) => r.id)])
      );
      try {
        localStorage.setItem(shownKey(session.user.id), JSON.stringify(merged));
      } catch {
        // Ignore storage failures (e.g. private mode).
      }
    }
    setOpen(false);
  }

  if (!open || reminders.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#171a20]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/15">
              <Bell className="h-5 w-5 text-[#B8942E]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("popup.title")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("popup.subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("popup.dismiss")}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-[#B8942E]" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {reminder.title.replace(/^Reminder:\s*/, "")}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {reminder.message}
                  </p>
                  {reminder.eventId && (
                    <Link
                      href={`/events/${reminder.eventId}`}
                      onClick={dismiss}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#B8942E] transition hover:text-[#8f7223] dark:text-[#D4AF37]"
                    >
                      {t("notif.bookNow")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button className="mt-5 w-full" onClick={dismiss}>
          {t("popup.dismiss")}
        </Button>
      </div>
    </div>
  );
}
