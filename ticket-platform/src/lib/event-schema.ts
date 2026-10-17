import { z } from "zod";

export const ticketTypeInputSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1, "Ticket name is required"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  available: z.coerce.number().int().min(0).optional(),
  description: z.string().trim().default(""),
});

export const eventInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  date: z.string().trim().min(1, "Date is required"),
  time: z.string().trim().min(1, "Time is required"),
  venue: z.string().trim().min(1, "Venue is required"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  category: z.string().trim().min(1, "Category is required"),
  organizer: z.string().trim().min(1, "Organizer is required"),
  genre: z.string().trim().optional(),
  image: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value ||
        value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://"),
      "Image must be a site path like /images/photo.jpg or an http(s):// URL — local file paths (C:\\...) don't work"
    ),
  ticketTypes: z.array(ticketTypeInputSchema).min(1, "Add at least one ticket type"),
});

export type EventInput = z.infer<typeof eventInputSchema>;
export type TicketTypeInput = z.infer<typeof ticketTypeInputSchema>;
