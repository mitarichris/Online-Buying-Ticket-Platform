"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CalendarPlus, Pencil, X, Tag, Upload } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Event } from "@/types";

const defaultCategories = [
  "Movies",
  "Sports",
  "Festivals",
  "Theater",
  "Conference",
  "Exhibitions",
  "Comedy",
  "Races",
];

const CUSTOM_CATEGORIES_KEY = "admin:customCategories";
const ADD_CATEGORY_VALUE = "__add__";

interface TicketDraft {
  id?: string;
  name: string;
  price: string;
  quantity: string;
  available: string;
  description: string;
}

const emptyTicket: TicketDraft = {
  name: "",
  price: "",
  quantity: "",
  available: "",
  description: "",
};

const initialForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  venue: "",
  address: "",
  city: "",
  category: defaultCategories[0],
  organizer: "",
  genre: "",
  image: "",
};

export default function AdminEventsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState(initialForm);
  const [tickets, setTickets] = useState<TicketDraft[]>([{ ...emptyTicket }]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const isAdmin = status === "authenticated" && session?.user?.isAdmin;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && !session?.user?.isAdmin) {
      router.replace("/");
    }
  }, [status, session, router]);

  const loadEvents = useCallback(() => {
    let custom: string[] = [];
    try {
      const stored = window.localStorage.getItem(CUSTOM_CATEGORIES_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          custom = parsed.filter(
            (c): c is string => typeof c === "string" && c.trim() !== ""
          );
        }
      }
    } catch {
      // Ignore corrupted localStorage.
    }

    return fetch("/api/events?all=1")
      .then((res) =>
        res.json().catch(() => []).then((data: unknown) => {
          if (!res.ok) {
            const message =
              data && typeof data === "object" && "error" in data
                ? (data as { error?: string }).error
                : undefined;
            throw new Error(message || t("admin.createFailed"));
          }
          return data;
        })
      )
      .then((data) => {
        const list: Event[] = Array.isArray(data) ? data : [];
        setEvents(list);

        const extra = [
          ...custom,
          ...list.map((event) => event.category).filter(Boolean),
        ];
        setCategories((current) => {
          const merged = [...current];
          for (const c of extra) {
            if (!merged.some((x) => x.toLowerCase() === c.toLowerCase())) {
              merged.push(c);
            }
          }
          return merged;
        });
      })
      .catch(() => {
        // Keep whatever list we already have.
      })
      .finally(() => {
        setLoadingEvents(false);
      });
  }, [t]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadEvents();
  }, [isAdmin, loadEvents]);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("admin.uploadFailed"));
      }
      updateField("image", data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("admin.uploadFailed"));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function updateTicket(index: number, key: keyof TicketDraft, value: string) {
    setTickets((prev) =>
      prev.map((ticket, i) => (i === index ? { ...ticket, [key]: value } : ticket))
    );
  }

  function addTicket() {
    setTickets((prev) => [...prev, { ...emptyTicket }]);
  }

  function removeTicket(index: number) {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCategoryChange(value: string) {
    if (value === ADD_CATEGORY_VALUE) {
      setAddingCategory(true);
      setNewCategory("");
      return;
    }
    setAddingCategory(false);
    updateField("category", value);
  }

  function addCategory() {
    const name = newCategory.trim();
    if (!name) return;

    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setForm((prev) => ({ ...prev, category: name }));
      setAddingCategory(false);
      setNewCategory("");
      return;
    }

    setCategories((prev) => [...prev, name]);
    setForm((prev) => ({ ...prev, category: name }));
    setAddingCategory(false);
    setNewCategory("");

    try {
      const stored = window.localStorage.getItem(CUSTOM_CATEGORIES_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      const custom = Array.isArray(parsed)
        ? parsed.filter((c): c is string => typeof c === "string")
        : [];
      if (!custom.some((c) => c.toLowerCase() === name.toLowerCase())) {
        window.localStorage.setItem(
          CUSTOM_CATEGORIES_KEY,
          JSON.stringify([...custom, name])
        );
      }
    } catch {
      // localStorage unavailable; category still works for this session.
    }
  }

  function resetForm() {
    setForm(initialForm);
    setTickets([{ ...emptyTicket }]);
    setEditingId(null);
    setAddingCategory(false);
    setNewCategory("");
  }

  async function startEdit(event: Event) {
    setEditingId(event.id);
    try {
      const res = await fetch(`/api/events/${event.id}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        throw new Error();
      }

      setForm({
        title: data.title ?? "",
        description: data.description ?? "",
        date: data.date ?? "",
        time: data.time ?? "",
        venue: data.venue ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        category: data.category ?? initialForm.category,
        organizer: data.organizer ?? "",
        genre: data.genre ?? "",
        image: data.image ?? "",
      });
      setTickets(
        Array.isArray(data.ticketTypes) && data.ticketTypes.length > 0
          ? data.ticketTypes.map(
              (ticket: {
                id: string;
                name: string;
                price: number;
                quantity: number;
                available: number;
                description: string;
              }): TicketDraft => ({
                id: ticket.id,
                name: ticket.name ?? "",
                price: String(ticket.price ?? ""),
                quantity: String(ticket.quantity ?? ""),
                available: String(ticket.available ?? ""),
                description: ticket.description ?? "",
              })
            )
          : [{ ...emptyTicket }]
      );

      if (
        data.category &&
        !categories.some((c) => c.toLowerCase() === data.category.toLowerCase())
      ) {
        setCategories((prev) => [...prev, data.category]);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error(t("admin.updateFailed"));
      setEditingId(null);
    }
  }

  async function handleDelete(event: Event) {
    if (!window.confirm(t("admin.confirmDelete", { title: event.title }))) {
      return;
    }

    setDeletingId(event.id);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("admin.deleteFailed"));
      }

      toast.success(t("admin.deleted"));
      if (editingId === event.id) {
        resetForm();
      }
      await loadEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("admin.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (tickets.length === 0) {
      toast.error(t("admin.needTicket"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        genre: form.genre || undefined,
        image: form.image || undefined,
        ticketTypes: tickets.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          price: Number(ticket.price),
          quantity: Number(ticket.quantity),
          available: ticket.available === "" ? undefined : Number(ticket.available),
          description: ticket.description,
        })),
      };

      const res = await fetch(
        editingId ? `/api/events/${editingId}` : "/api/events",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error || t(editingId ? "admin.updateFailed" : "admin.createFailed")
        );
      }

      if (editingId) {
        toast.success(t("admin.updated"));
      } else {
        toast.success(t("admin.created", { count: data.notified ?? 0 }));
      }

      resetForm();
      await loadEvents();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t(editingId ? "admin.updateFailed" : "admin.createFailed")
      );
    } finally {
      setSaving(false);
    }
  }

  if (status !== "authenticated" || !session?.user?.isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <CalendarPlus className="h-7 w-7 text-[#B8942E]" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {editingId ? t("admin.editTitle") : t("admin.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {editingId ? t("admin.editSubtitle") : t("admin.subtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {editingId && (
          <div className="flex items-center justify-between rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {t("admin.editing", { title: form.title })}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              <X className="mr-1 h-4 w-4" />
              {t("admin.cancelEdit")}
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("admin.details")}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label={t("admin.eventTitle")}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("admin.description")}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                required
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="date"
                label={t("admin.date")}
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                required
              />
              <Input
                label={t("admin.time")}
                placeholder="7:00 PM"
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
                required
              />
              <Input
                label={t("admin.venue")}
                value={form.venue}
                onChange={(e) => updateField("venue", e.target.value)}
                required
              />
              <Input
                label={t("admin.address")}
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                required
              />
              <Input
                label={t("admin.city")}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.category")}
                </label>
                <select
                  value={addingCategory ? ADD_CATEGORY_VALUE : form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value={ADD_CATEGORY_VALUE}>{t("admin.addCategory")}</option>
                </select>
                {addingCategory && (
                  <div className="flex gap-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder={t("admin.newCategory")}
                    />
                    <Button type="button" size="sm" onClick={addCategory}>
                      <Tag className="mr-1 h-4 w-4" />
                      {t("admin.add")}
                    </Button>
                  </div>
                )}
              </div>
              <Input
                label={t("admin.organizer")}
                value={form.organizer}
                onChange={(e) => updateField("organizer", e.target.value)}
                required
              />
              <Input
                label={t("admin.genre")}
                placeholder={t("admin.optional")}
                value={form.genre}
                onChange={(e) => updateField("genre", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Input
                label={t("admin.image")}
                placeholder="/images/my-event.jpg"
                value={form.image}
                onChange={(e) => updateField("image", e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      void handleImageUpload(file);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {!uploadingImage && <Upload className="mr-1 h-4 w-4" />}
                  {uploadingImage ? t("admin.uploading") : t("admin.uploadFromDevice")}
                </Button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t("admin.uploadHint")}
                </span>
              </div>
              {form.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={form.image}
                  alt={form.title || t("admin.image")}
                  className="mt-1 h-40 w-full max-w-sm rounded-lg border border-gray-200 object-cover dark:border-gray-800"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("admin.tickets")}</h2>
            <Button type="button" variant="outline" size="sm" onClick={addTicket}>
              <Plus className="mr-1 h-4 w-4" />
              {t("admin.addTicket")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tickets.map((ticket, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("admin.ticket", { count: index + 1 })}
                  </span>
                  {tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicket(index)}
                      className="text-red-500 transition hover:text-red-600"
                      aria-label={t("admin.removeTicket")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label={t("admin.ticketName")}
                    value={ticket.name}
                    onChange={(e) => updateTicket(index, "name", e.target.value)}
                    required
                  />
                  <Input
                    label={t("admin.ticketDescription")}
                    value={ticket.description}
                    onChange={(e) => updateTicket(index, "description", e.target.value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    label={t("admin.price")}
                    value={ticket.price}
                    onChange={(e) => updateTicket(index, "price", e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    min={1}
                    label={t("admin.quantity")}
                    value={ticket.quantity}
                    onChange={(e) => updateTicket(index, "quantity", e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    min={0}
                    label={t("admin.available")}
                    placeholder={t("admin.availableHint")}
                    value={ticket.available}
                    onChange={(e) => updateTicket(index, "available", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" loading={saving} size="lg" className="w-full">
          {editingId ? t("admin.update") : t("admin.create")}
        </Button>
      </form>

      <Card className="mt-10">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("admin.manageTitle")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("admin.manageSubtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingEvents ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("admin.noEvents")}
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {event.category} · {event.date} · {event.city}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(event)}
                    disabled={deletingId === event.id}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    {t("admin.edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(event)}
                    loading={deletingId === event.id}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    {t("admin.delete")}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
