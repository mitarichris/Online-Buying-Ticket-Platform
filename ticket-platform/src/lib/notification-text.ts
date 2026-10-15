type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface LocalizableNotification {
  title: string;
  message: string;
}

const REMINDER_PREFIX = "Reminder: ";
const NEW_EVENT_PREFIX = "New Event: ";

function extractDetails(message: string): string | null {
  const match = message.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}

function localizeWhen(when: string, t: Translate): string {
  if (when === "today" || when === "0") return t("notif.when.today");
  if (when === "tomorrow" || when === "1") return t("notif.when.tomorrow");
  const match = when.match(/^in (\d+) days?$/);
  if (match) return t("notif.when.inDays", { days: match[1] });
  return when;
}

/**
 * Notification rows are stored in English, but we render them in the user's
 * language by recognising the stored patterns and rebuilding the text from
 * translation keys. Falls back to the stored text for unknown notifications.
 */
export function getNotificationText(
  notification: LocalizableNotification,
  t: Translate
): { title: string; message: string } {
  const { title, message } = notification;

  if (title.startsWith(REMINDER_PREFIX)) {
    const inner = title.slice(REMINDER_PREFIX.length).replace(/!$/, "");
    const idx = inner.lastIndexOf(" is ");
    const eventTitle = idx >= 0 ? inner.slice(0, idx) : inner;
    const when = idx >= 0 ? inner.slice(idx + 4) : "";
    const whenText = localizeWhen(when, t);
    const details = extractDetails(message);
    return {
      title: t("notif.reminder.title", { title: eventTitle, when: whenText }),
      message: details
        ? t("notif.reminder.message", { title: eventTitle, when: whenText, details })
        : t("notif.reminder.messageNoDetails", { title: eventTitle, when: whenText }),
    };
  }

  if (title.startsWith(NEW_EVENT_PREFIX)) {
    const eventTitle = title.slice(NEW_EVENT_PREFIX.length);
    const details = extractDetails(message);
    return {
      title: t("notif.newEvent.title", { title: eventTitle }),
      message: details
        ? t("notif.newEvent.message", { title: eventTitle, details })
        : t("notif.newEvent.messageNoDetails", { title: eventTitle }),
    };
  }

  if (title === "Free Ticket Used") {
    return { title: t("notif.freeTicket.title"), message: t("notif.freeTicket.message") };
  }

  if (title === "Payment Successful") {
    return { title: t("notif.payment.title"), message: t("notif.payment.message") };
  }

  return { title, message };
}
