export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  category: string;
  image?: string;
  organizer: string;
  ticketTypes: TicketType[];
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  available: number;
  description: string;
}

export interface CartItem {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventImage: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  createdAt: string;
  paymentIntentId?: string;
}

export interface OrderItem {
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
}
