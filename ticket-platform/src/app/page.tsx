"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Ticket } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const featuredSlides = [
  {
    image: "/images/nba-allstar.jpeg",
    title: "NBA All-Star Game",
    date: "Feb 15, 2026",
    genre: "Sports",
    category: "sports",
  },
  {
    image: "/images/rock-night-2026.jpg",
    title: "Rock Night 2026",
    date: "Sep 5, 2026",
    genre: "Music Festival",
    category: "festivals",
  },
  {
    image: "/images/broadway-the-phantom.jpg",
    title: "The Phantom of the Opera",
    date: "Sep 12, 2026",
    genre: "Theater",
    category: "theater",
  },
  {
    image: "/images/tech-summit-2026.jpg",
    title: "Tech Summit 2026",
    date: "Oct 1, 2026",
    genre: "Conference",
    category: "exhibitions",
  },
  {
    image: "/images/modern-art-expo.jpg",
    title: "Modern Art Expo",
    date: "Nov 10, 2026",
    genre: "Expo",
    category: "exhibitions",
  },
  {
    image: "/images/comedy-night-special.jpg",
    title: "Comedy Night Special",
    date: "Aug 30, 2026",
    genre: "Comedy Show",
    category: "comedy",
  },
];

interface EventItem {
  id: string;
  title: string;
  image: string;
  date: string;
  genre: string;
  slug: string;
}

const popularEvents: EventItem[] = [
  { id: "evt_8", title: "NBA All-Star Game", image: "/images/nba-allstar.jpeg", date: "Feb 15, 2026", genre: "Sports", slug: "" },
  { id: "evt_7", title: "Champions League Finals", image: "/images/champions-league.png", date: "Aug 28, 2026", genre: "Sports", slug: "" },
  { id: "evt_1", title: "Rock Night 2026", image: "/images/rock-night-2026.jpg", date: "Sep 5, 2026", genre: "Music Festival", slug: "" },
  { id: "evt_2", title: "The Phantom of the Opera", image: "/images/broadway-the-phantom.jpg", date: "Sep 12, 2026", genre: "Theater", slug: "" },
  { id: "evt_3", title: "Tech Summit 2026", image: "/images/tech-summit-2026.jpg", date: "Oct 1, 2026", genre: "Conference", slug: "" },
  { id: "evt_4", title: "Jazz & Blues Festival", image: "/images/jazz-blues-festival.jpg", date: "Oct 15, 2026", genre: "Music Festival", slug: "" },
  { id: "evt_9", title: "Modern Art Expo", image: "/images/modern-art-expo.jpg", date: "Nov 10, 2026", genre: "Expo", slug: "" },
  { id: "evt_5", title: "Comedy Night Special", image: "/images/comedy-night-special.jpg", date: "Aug 30, 2026", genre: "Comedy Show", slug: "" },
  { id: "evt_6", title: "Electronic Music Festival", image: "/images/electronic-music-festival.jpg", date: "Dec 1, 2026", genre: "Music Festival", slug: "" },
  { id: "evt_10", title: "Auto Show 2026", image: "/images/auto-show.jpg", date: "Dec 5, 2026", genre: "Expo", slug: "" },
];

const sportsEvents: EventItem[] = [
  { id: "evt_8", title: "NBA All-Star Game", image: "/images/nba-allstar.jpeg", date: "Feb 15, 2026", genre: "Sports", slug: "" },
  { id: "evt_7", title: "Champions League Finals", image: "/images/champions-league.png", date: "Aug 28, 2026", genre: "Sports", slug: "" },
];

const musicEvents: EventItem[] = [
  { id: "evt_1", title: "Rock Night 2026", image: "/images/rock-night-2026.jpg", date: "Sep 5, 2026", genre: "Music Festival", slug: "" },
  { id: "evt_4", title: "Jazz & Blues Festival", image: "/images/jazz-blues-festival.jpg", date: "Oct 15, 2026", genre: "Music Festival", slug: "" },
  { id: "evt_6", title: "Electronic Music Festival", image: "/images/electronic-music-festival.jpg", date: "Dec 1, 2026", genre: "Music Festival", slug: "" },
];

const theaterEvents: EventItem[] = [
  { id: "evt_2", title: "The Phantom of the Opera", image: "/images/broadway-the-phantom.jpg", date: "Sep 12, 2026", genre: "Theater", slug: "" },
  { id: "evt_16", title: "Hamlet: A Modern Retelling", image: "/images/hamlet-modern.svg", date: "Nov 14, 2026", genre: "Theater", slug: "" },
  { id: "evt_17", title: "The Lion King on Stage", image: "/images/lion-king-stage.svg", date: "Jan 22, 2027", genre: "Theater", slug: "" },
];

const conferenceEvents: EventItem[] = [
  { id: "evt_3", title: "Tech Summit 2026", image: "/images/tech-summit-2026.jpg", date: "Oct 1, 2026", genre: "Conference", slug: "" },
  { id: "evt_18", title: "Africa Tech Conference 2027", image: "/images/africa-tech-conference.svg", date: "Mar 10, 2027", genre: "Conference", slug: "" },
  { id: "evt_19", title: "Global Health Forum", image: "/images/global-health-forum.svg", date: "Apr 5, 2027", genre: "Conference", slug: "" },
];

const expoEvents: EventItem[] = [
  { id: "evt_9", title: "Modern Art Expo", image: "/images/modern-art-expo.jpg", date: "Nov 10, 2026", genre: "Expo", slug: "" },
  { id: "evt_10", title: "Auto Show 2026", image: "/images/auto-show.jpg", date: "Dec 5, 2026", genre: "Expo", slug: "" },
];

const comedyEvents: EventItem[] = [
  { id: "evt_5", title: "Comedy Night Special", image: "/images/comedy-night-special.jpg", date: "Aug 30, 2026", genre: "Comedy Show", slug: "" },
  { id: "evt_20", title: "Laugh Out Loud Rwanda", image: "/images/laugh-out-loud-rwanda.svg", date: "Oct 30, 2026", genre: "Comedy Show", slug: "" },
  { id: "evt_21", title: "The Big Gig: Comedy Festival", image: "/images/the-big-gig.svg", date: "Feb 12, 2027", genre: "Comedy Show", slug: "" },
];

const moviesEvents: EventItem[] = [
  { id: "evt_11", title: "Avengers: Doomsday", image: "/images/avengers-doomsday.jpg", date: "Dec 18, 2026", genre: "Superhero", slug: "" },
  { id: "evt_12", title: "The Odyssey (IMAX)", image: "/images/the-odyssey.jpg", date: "Nov 6, 2026", genre: "Epic", slug: "" },
  { id: "evt_13", title: "Toy Story 5", image: "/images/toy-story-5.jpg", date: "Nov 20, 2026", genre: "Family", slug: "" },
  { id: "evt_14", title: "Moana", image: "/images/moana.jpg", date: "Dec 4, 2026", genre: "Adventure", slug: "" },
  { id: "evt_15", title: "Star Wars: The Mandalorian and Grogu", image: "/images/mandalorian-and-grogu.jpg", date: "Dec 11, 2026", genre: "Sci-Fi", slug: "" },
];

function EventCard({ event }: { event: EventItem }) {
  const { t } = useLanguage();
  return (
    <Link href={`/events/${event.id}`} className="group flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
      <div className="relative overflow-hidden rounded-lg">
        <div className="aspect-[5/7] relative bg-[#2b2e39] overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            loading="eager"
            unoptimized
            sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, 180px"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1 rounded bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#0F172A] w-fit">
              <Ticket className="h-3 w-3" />
              {t("home.bookNow")}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-1 px-0.5">
        <p className="text-xs text-white truncate">{event.title}</p>
        <p className="text-[11px] text-white/70">{event.genre} &middot; {event.date}</p>
      </div>
    </Link>
  );
}

function ContentRow({ title, events }: { title: string; events: EventItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <article className="mb-8 md:mb-10">
      <div className="flex items-center justify-between px-4 md:px-5 mb-3">
        <h2 className="text-base md:text-lg font-bold text-white">{title}</h2>
        <Link href="/events" className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors">
          {t("home.more")}
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="relative group/row">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-5 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((event) => (
            <EventCard key={event.id + event.title} event={event} />
          ))}
        </div>
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 top-1/3 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-1 top-1/3 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { t } = useLanguage();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = featuredSlides[currentSlide];

  return (
    <div className="min-h-screen bg-[#101114]">
      <section className="relative w-full h-[200px] sm:h-[260px] md:h-[320px] lg:h-[400px] overflow-hidden">
        {featuredSlides.map((s, index) => (
          <div
            key={index}
            className={`absolute inset-0 overflow-hidden transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100 z-[1]" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover object-center"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101114] via-[#101114]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#101114]/60 via-transparent to-transparent h-20" />
          </div>
        ))}

        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-16 md:p-6 md:pb-12">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                {slide.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-xs md:text-sm text-white/70">
                <span>{slide.genre}</span>
                <span className="w-px h-3 bg-white/30" />
                <span>{slide.date}</span>
              </div>
            </div>
            <Link
              href={`/events?category=${slide.category}`}
              className="flex items-center gap-2 rounded bg-[#D4AF37] px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-semibold text-[#0F172A] hover:bg-[#B8942E] transition-colors"
            >
              <Ticket className="h-4 w-4" />
              {t("home.bookNow")}
            </Link>
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 flex gap-1.5">
          {featuredSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-6 bg-gradient-to-r from-[#0F172A] to-[#D4AF37]"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      <div className="mt-6 md:mt-8">
        <ContentRow title={t("home.row.popular")} events={popularEvents} />
        <ContentRow title={t("home.row.movies")} events={moviesEvents} />
        <ContentRow title={t("home.row.sports")} events={sportsEvents} />
        <ContentRow title={t("home.row.music")} events={musicEvents} />
        <ContentRow title={t("home.row.theater")} events={theaterEvents} />
        <ContentRow title={t("home.row.conferences")} events={conferenceEvents} />
        <ContentRow title={t("home.row.expos")} events={expoEvents} />
        <ContentRow title={t("home.row.comedy")} events={comedyEvents} />
      </div>

      <footer className="border-t border-white/10 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 text-center">
          <p className="text-xs text-white/80 leading-5">
            {t("home.disclaimer")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 text-xs font-bold text-white/80">
            <span>{t("home.about")}</span>
            <Link href="/events" className="hover:text-white transition-colors">{t("home.browseEvents")}</Link>
            <span className="h-3 w-px bg-white/30 hidden sm:block" />
            <Link href="/register" className="hover:text-white transition-colors">{t("home.createAccount")}</Link>
            <span className="h-3 w-px bg-white/30 hidden sm:block" />
            <Link href="/privacy" className="hover:text-white transition-colors">{t("home.privacy")}</Link>
            <span className="h-3 w-px bg-white/30 hidden sm:block" />
            <Link href="/user-agreement" className="hover:text-white transition-colors">{t("home.agreement")}</Link>
            <span className="h-3 w-px bg-white/30 hidden sm:block" />
            <Link href="/contact-us" className="hover:text-white transition-colors">{t("home.contact")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
