export const amenities = [
  { name: "Accessible", icon: "/assets/dummy-icon.png" },
  { name: "Family Friendly", icon: "/assets/dummy-icon.png" },
  { name: "Pool", icon: "/assets/dummy-icon.png" },
  { name: "Free WiFi", icon: "/assets/dummy-icon.png" },
  { name: "Boat Ramp", icon: "/assets/dummy-icon.png" },
  { name: "Parking", icon: "/assets/dummy-icon.png" },
];

export const passes = [
  {
    duration: "1-DAY",
    name: "1 Day Wine Tasting Pass",
    price: "$50.00",
    textColor: "text-[#874E4E]",
    bgColor: "bg-[#874E4E]",
    bgLight: "bg-[#874E4E]/20",
  },
  {
    duration: "2-DAYS",
    name: "2 Day Wine Tasting Pass",
    price: "$99.00",
    textColor: "text-[#71874E]",
    bgColor: "bg-[#71874E]",
    bgLight: "bg-[#71874E]/20",
  },
];

export const events = [
  {
    id: 1,
    title: "Starlight Bites & Delights",
    location: "2000 W. First Street, Fort Meyers, FL 33901",
    date: "October 5th, 2024",
    time: "(5pm-9pm)",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop",
    bgColor: "bg-orange-500"
  },
  {
    id: 2,
    title: "Ember Nights Campfire",
    location: "3902 Sunshine Palm Way, Kissimmee, FL 34747",
    date: "September 29th, 2024",
    time: "(5pm-11pm)",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    bgColor: "bg-red-600"
  },
  {
    id: 3,
    title: "Starlight Star Gazing",
    location: "3902 Sunshine Palm Way, Kissimmee, FL 34747",
    date: "August 27th, 2024",
    time: "(8pm-11pm)",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
    bgColor: "bg-orange-500"
  }
];

export const deals = [
  {
    id: 1,
    title: "Wine Wednesdays",
    description: "1/2 off select pours every wednesday!",
    location: "The Wine Emporium",
    date: "Aug 01, 2024 To Oct 31, 2024",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "2-4-1 Draft Beers",
    description: "Come visit us for a cold brew!",
    location: "Sizzle & Savor Steakhouse",
    date: "Started from 7/1/2024",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "$2 Taco Tuesdays",
    description: "Huge savings on Tuesday! Celebrate Taco Tuesday with $2 tacos!",
    location: "Hacienda",
    date: "Jun 01, 2024 To Dec 31, 2024",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop",
  }
];

export const coupons = [
  {
    discount: "10% Off",
    subtitle: "Individual Tours",
    description: 'Requires advanced booking. Click "Redeem" for more info.',
    location: "Horse Farms",
    expiration: "None",
  },
  {
    discount: "15% Off",
    subtitle: "Cottage Rentals",
    description: "Valid Monday-Thursday. Subject to Availability",
    location: "Starlight Oasis Glamping",
    expiration: "December 15, 2024",
  },
];

export const contactInfo = {
  address: "3902 Sunshine Palm Way, Kissimmee, FL 34747",
  phone: "901-745-0354",
  website: {
    url: "https://www.starlight.com/EmberNights",
    display: "www.starlight.com/EmberNights"
  },
  socialMedia: [
    { name: "facebook", icon: "/icons/facebook.svg" },
    { name: "x", icon: "/icons/x.svg" },
    { name: "instagram", icon: "/icons/instagram.svg" },
    { name: "youtube", icon: "/icons/youtube.svg" },
    { name: "tripadvisor", icon: "/icons/tripadvisor.svg" },
    { name: "yelp", icon: "/icons/yelp.svg" }
  ]
};

export const businessHours = {
  weekdays: "Monday - Friday (8 AM to 6 PM)",
  weekend: "Saturday - Sunday (8 AM to 10 PM)"
};

export const highlights = [
  "Special Event Booking",
  "Tours",
  "Classes and Education",
  "Group Events"
];

export const weatherInfo = {
  temperature: "24°",
  location: "Ocala County",
  dateTime: "09:30 • 03/08",
  forecast: ["Today", "Thu", "Fri", "Sat", "Sun", "Mon"]
};

export const reviews = [
  {
    user: "Sarah M.",
    time: "3 hours ago",
    content: "Always fresh pours!",
    location: "Lake Oklawaha RV Park",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    hasImage: true,
  },
  {
    user: "Mike C.",
    time: "7 hours ago",
    content: "Beers!",
    location: "Lake Oklawaha RV Park",
    hasImage: false,
  },
  {
    user: "Emily R.",
    time: "a day ago",
    content: "Always fresh pours!",
    location: "Lake Oklawaha RV Park",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
    hasImage: true,
  },
  {
    user: "John D.",
    time: "2 days ago",
    content: "Great experience!",
    location: "Lake Oklawaha RV Park",
    hasImage: false,
  }
];
