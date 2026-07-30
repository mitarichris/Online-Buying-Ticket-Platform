"use client";

import Link from "next/link";
import { ShoppingCart, Ticket, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <Ticket className="h-6 w-6" />
          <span>TicketHub</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/events" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Events
          </Link>
          {session ? (
            <>
              <Link href="/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                My Orders
              </Link>
              <span className="text-sm text-gray-500">{session.user?.name || session.user?.email}</span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 bg-white p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/events" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>
              Events
            </Link>
            {session ? (
              <>
                <Link href="/orders" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>
                  My Orders
                </Link>
                <button onClick={() => signOut()} className="text-left text-sm font-medium text-gray-600">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
