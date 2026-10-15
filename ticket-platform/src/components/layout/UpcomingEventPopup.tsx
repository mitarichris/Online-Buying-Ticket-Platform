"use client";

import { useCallback, useEffect, useState } from "react";
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

export function UpcomingEventPopup() {
  const { status, data: session } = useSession();
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<ReminderNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  const userId = session?.user?.id;

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    let active = true;

    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ReminderNotification[]) => {
        if (!active || !Array.isArray(data)) return;
        const fresh = data.filter(
          (n) =>
            !n.read &&
            n.eventId &&
            typeof n.title === "string" &&
            n.title.startsWith("Reminder:")
        );
        if (fresh.length > 0) {
          setReminders(fresh);
          setOpen(true);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [status, userId]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const dismiss = useCallback(() => {
    if (reminders.length > 0) {
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reminders.map((r) => r.id) }),
      }).catch(() => {});
    }
    setVisible(false);
    window.setTimeout(() => setOpen(false), 250);
  }, [reminders]);

  useEffect(() => {
    if (!open || paused) return;
    const timer = window.setTimeout(() => dismiss(), 7000);
    return () => window.clearTimeout(timer);
  }, [open, paused, dismiss]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, dismiss]);

  if (!open || reminders.length === 0) return null;

  return (
    <div
      className="fixed inset-x-3 top-20 z-[100] flex justify-end sm:inset-x-auto sm:right-4"
      role="region"
      aria-live="polite"
    >
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className={`w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl transition-all duration-300 ease-out dark:border-white/10 dark:bg-[#171a20] ${
          visible ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
              <Bell className="h-5 w-5 text-[#B8942E]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{t("popup.title")}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("popup.subtitle")}</p>
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

        <div className="max-h-[55vh] space-y-3 overflow-y-auto">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="rounded-xl border border-gray-200 p-3.5 dark:border-gray-800"
            >
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-[#B8942E]" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
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

        <Button className="mt-4 w-full" size="sm" onClick={dismiss}>
          {t("popup.dismiss")}
        </Button>
      </div>
    </div>
  );
}
