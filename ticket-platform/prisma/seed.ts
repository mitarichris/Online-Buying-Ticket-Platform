import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const events = [
    {
      id: "evt_1",
      title: "Rock Night 2026",
      description: "An unforgettable night of rock music featuring top bands from around the world.",
      date: "2026-09-15",
      time: "7:00 PM",
      venue: "Madison Square Garden",
      address: "4 Pennsylvania Plaza",
      city: "New York",
      category: "Festivals",
      organizer: "Live Nation",
      image: "/images/rock-night-2026.jpg",
      ticketTypes: [
        { id: "tkt_1", name: "General Admission", price: 65000, quantity: 1000, available: 500, description: "Standing area" },
        { id: "tkt_2", name: "VIP", price: 169000, quantity: 200, available: 50, description: "VIP lounge access + front row" },
        { id: "tkt_3", name: "Balcony Seated", price: 104000, quantity: 300, available: 200, description: "Reserved balcony seating" },
      ],
    },
    {
      id: "evt_2",
      title: "Broadway: The Phantom",
      description: "Experience the legendary musical that has captivated audiences for decades.",
      date: "2026-10-20",
      time: "8:00 PM",
      venue: "Majestic Theatre",
      address: "245 W 44th St",
      city: "New York",
      category: "Theater",
      organizer: "Broadway Productions",
      image: "/images/broadway-the-phantom.png",
      ticketTypes: [
        { id: "tkt_4", name: "Orchestra", price: 195000, quantity: 500, available: 120, description: "Best view of the stage" },
        { id: "tkt_5", name: "Mezzanine", price: 130000, quantity: 400, available: 250, description: "Center balcony seating" },
      ],
    },
    {
      id: "evt_3",
      title: "Tech Summit 2026",
      description: "The biggest tech conference of the year.",
      date: "2026-11-05",
      time: "9:00 AM",
      venue: "Moscone Center",
      address: "747 Howard St",
      city: "San Francisco",
      category: "Conference",
      organizer: "TechEvents Inc.",
      image: "/images/tech-summit-2026.png",
      ticketTypes: [
        { id: "tkt_6", name: "Standard Pass", price: 390000, quantity: 2000, available: 800, description: "Full conference access" },
        { id: "tkt_7", name: "VIP Pass", price: 780000, quantity: 500, available: 150, description: "VIP networking + workshops" },
      ],
    },
    {
      id: "evt_4",
      title: "Jazz & Blues Festival",
      description: "A weekend of smooth jazz and soulful blues.",
      date: "2026-08-22",
      time: "2:00 PM",
      venue: "Grant Park",
      address: "337 E Randolph St",
      city: "Chicago",
      category: "Festivals",
      organizer: "Chicago Events Co.",
      image: "/images/jazz-blues-festival.jpg",
      ticketTypes: [
        { id: "tkt_8", name: "Day Pass", price: 52000, quantity: 5000, available: 3000, description: "Single day access" },
        { id: "tkt_9", name: "Weekend Pass", price: 117000, quantity: 2000, available: 1000, description: "Full weekend access" },
      ],
    },
    {
      id: "evt_5",
      title: "Comedy Night Special",
      description: "A hilarious evening with top stand-up comedians.",
      date: "2026-12-10",
      time: "8:30 PM",
      venue: "The Comedy Store",
      address: "8433 Sunset Blvd",
      city: "Los Angeles",
      category: "Comedy",
      organizer: "Comedy Central Live",
      image: "/images/comedy-night-special.jpg",
      ticketTypes: [
        { id: "tkt_10", name: "General", price: 45500, quantity: 300, available: 100, description: "General seating" },
        { id: "tkt_11", name: "Premium", price: 84500, quantity: 100, available: 40, description: "Front row + meet & greet" },
      ],
    },
    {
      id: "evt_6",
      title: "Electronic Music Festival",
      description: "Three days of electronic music with world-renowned DJs.",
      date: "2027-01-15",
      time: "12:00 PM",
      venue: "Kigali Arena",
      address: "KG 14 Ave",
      city: "Kigali, Rwanda",
      category: "Festivals",
      organizer: "Festival Productions",
      image: "/images/electronic-music-festival.png",
      ticketTypes: [
        { id: "tkt_12", name: "3-Day Pass", price: 260000, quantity: 10000, available: 4500, description: "Full festival access" },
        { id: "tkt_13", name: "VIP Cabin", price: 650000, quantity: 500, available: 200, description: "Private cabin + express entry" },
      ],
    },
    {
      id: "evt_7",
      title: "Champions League Final",
      description: "The biggest football match of the year as top European clubs battle for glory.",
      date: "2026-12-12",
      time: "8:00 PM",
      venue: "Wembley Stadium",
      address: "Stadium Way",
      city: "London",
      category: "Sports",
      organizer: "UEFA",
      image: "/images/champions-league.png",
      ticketTypes: [
        { id: "tkt_14", name: "Standard", price: 130000, quantity: 5000, available: 2000, description: "Upper tier seating" },
        { id: "tkt_15", name: "Premium", price: 390000, quantity: 1000, available: 300, description: "Lower tier + hospitality" },
      ],
    },
    {
      id: "evt_8",
      title: "NBA All-Star Game 2026",
      description: "Watch the best basketball players in the world compete in this annual showcase.",
      date: "2026-02-15",
      time: "7:30 PM",
      venue: "Chase Center",
      address: "1 Warriors Way",
      city: "San Francisco",
      category: "Sports",
      organizer: "NBA",
      image: "/images/nba-allstar.jpeg",
      ticketTypes: [
        { id: "tkt_16", name: "Upper Bowl", price: 84500, quantity: 3000, available: 1200, description: "Upper level seating" },
        { id: "tkt_17", name: "Floor Seats", price: 325000, quantity: 500, available: 100, description: "Courtside experience" },
      ],
    },
    {
      id: "evt_9",
      title: "Modern Art Expo 2026",
      description: "Discover groundbreaking contemporary art from emerging and renowned artists worldwide. Running from September 15–19.",
      date: "2026-09-15",
      time: "10:00 AM",
      venue: "Kigali Convention Center",
      address: "KG 2 Ave",
      city: "Kigali",
      category: "Exhibitions",
      organizer: "ArtWorld Collective",
      image: "/images/modern-art-expo.png",
      ticketTypes: [
        { id: "tkt_18", name: "General Admission", price: 26000, quantity: 2000, available: 1000, description: "Full access to all exhibits" },
        { id: "tkt_19", name: "VIP Preview", price: 78000, quantity: 300, available: 100, description: "Exclusive preview + champagne reception" },
      ],
    },
    {
      id: "evt_10",
      title: "International Auto Show",
      description: "See the latest cars, concept vehicles, and automotive innovations from top manufacturers. Running from May 22–31.",
      date: "2026-05-22",
      time: "9:00 AM",
      venue: "Global Expo Center",
      address: "Dubai World Trade Centre, Dubai",
      city: "Dubai, United Arab Emirates",
      category: "Exhibitions",
      organizer: "AutoExpo Inc.",
      image: "/images/auto-show.png",
      ticketTypes: [
        { id: "tkt_20", name: "Day Pass", price: 32500, quantity: 5000, available: 3000, description: "Single day entry" },
        { id: "tkt_21", name: "Weekend Pass", price: 71500, quantity: 2000, available: 1000, description: "Full weekend access" },
      ],
    },
  ];

  await prisma.user.create({
    data: {
      id: "user_demo",
      name: "Demo User",
      email: "demo@example.com",
      password: "$2b$12$0N5qVZaz2c7wDQBGmGLgEOGdKThqJutzWdKA4erGzFrodwrxgbYL2",
    },
  });

  for (const evt of events) {
    const { ticketTypes, ...eventData } = evt;
    await prisma.event.create({
      data: {
        ...eventData,
        ticketTypes: {
          create: ticketTypes,
        },
      },
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
