import { create } from "zustand";
import type { CartItem, TicketType } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (eventId: string, ticketTypeId: string) => void;
  updateQuantity: (eventId: string, ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (eventId, ticketTypeId) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.eventId === eventId && i.ticketTypeId === ticketTypeId)
      ),
    })),
  updateQuantity: (eventId, ticketTypeId, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter(
            (i) => !(i.eventId === eventId && i.ticketTypeId === ticketTypeId)
          )
        : state.items.map((i) =>
            i.eventId === eventId && i.ticketTypeId === ticketTypeId
              ? { ...i, quantity }
              : i
          ),
    })),
  clearCart: () => set({ items: [] }),
  getTotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  getItemCount: () =>
    get().items.reduce((count, item) => count + item.quantity, 0),
}));
