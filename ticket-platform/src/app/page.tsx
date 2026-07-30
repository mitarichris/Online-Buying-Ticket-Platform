import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Clapperboard, Laugh, Palette, Music, ArrowRight } from "lucide-react";

const categories = [
  { icon: Trophy, title: "Sports", description: "Live matches, tournaments, and sporting events.", slug: "sports" },
  { icon: Clapperboard, title: "Theater", description: "Broadway shows, plays, and stage performances.", slug: "theater" },
  { icon: Laugh, title: "Comedy", description: "Stand-up, improv, and comedy nights.", slug: "comedy" },
  { icon: Palette, title: "Exhibitions", description: "Art shows, trade fairs, and expos.", slug: "exhibitions" },
  { icon: Music, title: "Festivals", description: "Music festivals, cultural celebrations, and more.", slug: "festivals" },
  { icon: ArrowRight, title: "View All", description: "Browse all event categories.", slug: "", highlight: true },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[600px] bg-cover bg-center bg-no-repeat text-white" style={{ backgroundImage: "url('/images/hero-bg.png')" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Your Tickets,{" "}
            <span className="text-indigo-200">One Click Away</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100">
            Discover and book tickets for concerts, theatre shows, conferences, and more.
            The best events are waiting for you.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/events">
              <Button size="lg" variant="primary">
                Browse Events
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="primary">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
          <p className="mt-4 text-gray-500">
            Find the perfect event from our wide range of categories.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.slug ? `/events?category=${cat.slug}` : "/events"}
              className={`group rounded-xl p-6 text-center transition hover:shadow-lg ${cat.highlight ? "border-2 border-dashed border-gray-300 hover:border-indigo-400" : "bg-white shadow-sm"}`}
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl transition ${cat.highlight ? "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600" : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200"}`}>
                <cat.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">{cat.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to find your next event?</h2>
          <p className="mt-4 text-gray-500">
            Join thousands of happy customers who trust TicketHub for their ticket purchases.
          </p>
          <Link href="/events">
            <Button size="lg" className="mt-8">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
