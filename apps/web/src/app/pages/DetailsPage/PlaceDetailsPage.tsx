"use client";
import React, { useState } from "react";

type SearchParams = { id?: string };

const Stat: React.FC<{ icon?: string; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    {icon && <img src={icon} alt="icon" className="w-4 h-4" />}
    <span>{label}</span>
  </div>
);

const SectionHeader: React.FC<{ title: string; actionText?: string }> = ({ title, actionText }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    {actionText && <button className="text-[var(--color-primary)] text-sm font-medium hover:underline">{actionText}</button>}
  </div>
);

const CardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
);

const ThumbCard: React.FC<{ title: string; subtitle?: string; img?: string; price?: string }> = ({ title, subtitle, img, price }) => (
  <div className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="h-32 bg-gray-200" style={{ backgroundImage: img ? `url(${img})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div className="p-4">
      <div className="text-gray-900 text-sm font-semibold truncate">{title}</div>
      {subtitle && <div className="text-gray-600 text-xs mt-1 line-clamp-2">{subtitle}</div>}
      {price && <div className="text-[var(--color-primary)] font-bold text-sm mt-2">{price}</div>}
    </div>
  </div>
);

const AmenityIcon: React.FC<{ name: string }> = ({ name }) => {
  const iconMap: { [key: string]: string } = {
    'Wi-Fi': '/assets/Icons/Check.svg',
    'Pool': '/assets/Icons/Check.svg',
    'Kitchen': '/assets/Icons/Check.svg',
    'Air conditioning': '/assets/Icons/Check.svg',
    'Breakfast': '/assets/Icons/Check.svg',
    'Free parking': '/assets/Icons/Check.svg',
    'Pet friendly': '/assets/Icons/Check.svg',
    'TV': '/assets/Icons/Check.svg',
  };
  
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
      <img src={iconMap[name] || '/assets/Icons/Check.svg'} alt={name} className="w-5 h-5" />
      <span className="text-sm font-medium text-gray-700">{name}</span>
    </div>
  );
};

const PlaceDetailPage: React.FC<{ searchParams: SearchParams }> = ({ searchParams }) => {
  const id = searchParams?.id || "—";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [
    '/assets/placeholder_hero.jpg',
    '/assets/placeholder_hero.jpg',
    '/assets/placeholder_hero.jpg',
    '/assets/placeholder_hero.jpg',
    '/assets/placeholder_hero.jpg'
  ];

  return (
    <div className="w-full bg-[var(--color-background)] min-h-screen">
      {/* Hero + Side widgets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg">
              <div className="h-80 sm:h-96 bg-gray-300 relative" style={{ backgroundImage: `url(${images[currentImageIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {/* Navigation Arrows */}
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                  onClick={() => setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : images.length - 1)}
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                  onClick={() => setCurrentImageIndex((prev) => prev < images.length - 1 ? prev + 1 : 0)}
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i === currentImageIndex ? 'bg-[var(--color-primary)]' : 'bg-white/70'
                      }`}
                      onClick={() => setCurrentImageIndex(i)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors">
                <img src="/assets/Icons/Check.svg" alt="Stamp" className="w-5 h-5" />
                Stamp Passport
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-secondary)] text-white rounded-xl font-semibold hover:bg-[var(--color-secondary-dark)] transition-colors">
                <img src="/assets/Icons/Check.svg" alt="Check-in" className="w-5 h-5" />
                Check-In
              </button>
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                <img src="/assets/Icons/Check.svg" alt="Share" className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                <img src="/assets/Icons/Check.svg" alt="Save" className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Map Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20"></div>
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-sm font-semibold text-gray-900">Interactive Map</div>
                    <div className="text-xs text-gray-600 mt-1">3902 Sunshine Palm Way, Kissimmee, FL</div>
                  </div>
                </div>
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <img src="/assets/Icons/Expand-Map.svg" alt="Expand" className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-3">Get directions and explore the area</div>
                <button className="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
                  Get Directions
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src="/assets/Icons/Check.svg" alt="Phone" className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">(407) 555-0123</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src="/assets/Icons/Check.svg" alt="Website" className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer">Visit Website</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src="/assets/Icons/Check.svg" alt="Hours" className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Open 24/7</span>
                </div>
              </div>
            </div>

            {/* Social Share */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Place</h3>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <img src="/assets/Social_Logos/facebook.svg" alt="Facebook" className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors">
                  <img src="/assets/Social_Logos/instagram.svg" alt="Instagram" className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <img src="/assets/Social_Logos/twitter.svg" alt="Twitter" className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                  <img src="/assets/Social_Logos/pinterest.svg" alt="Pinterest" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Title and Description Section */}
        <div className="mt-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Starlight Oasis Glamping #{id}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <img src="/assets/Icons/Pin-Icon-Btn.svg" alt="Location" className="w-4 h-4" />
                <span className="text-sm">3902 Sunshine Palm Way, Kissimmee, FL 34747</span>
              </div>
              
              {/* Enhanced Description */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About This Place</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Experience the magic of glamping under the stars at Starlight Oasis. Our luxury tents offer 
                  the perfect blend of outdoor adventure and modern comfort. Wake up to breathtaking views, 
                  enjoy premium amenities, and create unforgettable memories in the heart of nature.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Whether you're seeking a romantic getaway or a family adventure, our glamping experience 
                  provides everything you need for the perfect outdoor retreat. From stargazing to campfire 
                  stories, every moment is designed to be extraordinary.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced badges/stats */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-8">
            <Stat icon="/assets/Icons/Check.svg" label="Open Now" />
            <Stat icon="/assets/Icons/Check.svg" label="Pet Friendly" />
            <Stat icon="/assets/Icons/Check.svg" label="Parking Available" />
            <Stat icon="/assets/Icons/Check.svg" label="Live Entertainment" />
            <Stat icon="/assets/Icons/Check.svg" label="Wi-Fi Available" />
            <Stat icon="/assets/Icons/Check.svg" label="Pool Access" />
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-12">
          {/* Enhanced Amenities */}
          <section>
            <SectionHeader title="Amenities & Features" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {['Wi‑Fi','Pool','Kitchen','Air conditioning','Breakfast','Free parking','Pet friendly','TV'].map(amenity => (
                <AmenityIcon key={amenity} name={amenity} />
              ))}
            </div>
          </section>

          {/* Enhanced Events */}
          <section>
            <SectionHeader title="Upcoming Events" actionText="See all" />
            <CardGrid>
              <ThumbCard 
                title="Live Music Night" 
                subtitle="Every Friday, 7 PM - 10 PM" 
                img="/assets/placeholder_hero.jpg"
              />
              <ThumbCard 
                title="Campfire Stories" 
                subtitle="Saturday, Family-friendly event" 
                img="/assets/placeholder_hero.jpg"
              />
              <ThumbCard 
                title="Stargazing Tour" 
                subtitle="Weekend Special with telescope" 
                img="/assets/placeholder_hero.jpg"
              />
            </CardGrid>
          </section>

          {/* Enhanced Passes */}
          <section>
            <SectionHeader title="Experience Passes" actionText="View all" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Day Pass", duration: "Valid for 1 day", price: "$49", features: ["Pool access", "Wi-Fi", "Parking"] },
                { name: "Weekend Pass", duration: "Valid for 2 days", price: "$89", features: ["All day pass features", "Events access", "Breakfast"] },
                { name: "Premium Pass", duration: "Valid for 3 days", price: "$129", features: ["All weekend features", "VIP access", "Free meals"] }
              ].map((pass, i) => (
                <div key={i} className="border-2 border-gray-200 rounded-2xl p-6 bg-white hover:border-[var(--color-primary)] transition-colors">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pass.name}</h3>
                    <div className="text-sm text-gray-600 mb-3">{pass.duration}</div>
                    <div className="text-3xl font-bold text-[var(--color-primary)]">{pass.price}</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {pass.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <img src="/assets/Icons/Check.svg" alt="Check" className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-[var(--color-primary)] text-white rounded-xl py-3 font-semibold hover:bg-[var(--color-primary-dark)] transition-colors">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Enhanced Deals */}
          <section>
            <SectionHeader title="Special Deals" actionText="View all" />
            <CardGrid>
              <ThumbCard 
                title="20% Off Weekday Stay" 
                subtitle="Monday - Thursday bookings" 
                img="/assets/placeholder_hero.jpg"
                price="Save up to $50"
              />
              <ThumbCard 
                title="Buy 1 Get 1 Free" 
                subtitle="Valid for weekend passes" 
                img="/assets/placeholder_hero.jpg"
                price="Limited time offer"
              />
              <ThumbCard 
                title="Free Breakfast Package" 
                subtitle="Complimentary morning meal" 
                img="/assets/placeholder_hero.jpg"
                price="Worth $25"
              />
            </CardGrid>
          </section>

          {/* Enhanced Coupons */}
          <section>
            <SectionHeader title="Available Coupons" actionText="View all" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { code: "WELCOME10", discount: "10% OFF", description: "First time visitors" },
                { code: "FREEPASS", discount: "Free Entry", description: "Kids under 12" },
                { code: "FAMILY20", discount: "20% OFF", description: "Family packages" }
              ].map((coupon, i) => (
                <div key={i} className="relative rounded-2xl p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative z-10">
                    <div className="text-2xl font-bold text-orange-700 mb-2">{coupon.discount}</div>
                    <div className="text-sm text-orange-600 mb-3">{coupon.description}</div>
                    <div className="text-xs text-orange-500 mb-4 font-mono bg-orange-100 px-3 py-1 rounded-full inline-block">
                      Code: {coupon.code}
                    </div>
                    <button className="w-full bg-orange-600 text-white rounded-xl py-3 font-semibold hover:bg-orange-700 transition-colors">
                      Redeem Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Enhanced Testimonials */}
          <section>
            <SectionHeader title="What Our Guests Say" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Sarah Johnson",
                  date: "2 days ago",
                  rating: 5,
                  comment: "Absolutely magical experience! The luxury tents were incredibly comfortable and the stargazing was unforgettable. Perfect for our anniversary getaway.",
                  avatar: "/assets/placeholder_hero.jpg"
                },
                {
                  name: "Mike Chen",
                  date: "1 week ago", 
                  rating: 5,
                  comment: "Great family-friendly glamping spot. Kids loved the campfire stories and we adults enjoyed the peaceful atmosphere. Highly recommended!",
                  avatar: "/assets/placeholder_hero.jpg"
                },
                {
                  name: "Emily Rodriguez",
                  date: "2 weeks ago",
                  rating: 4,
                  comment: "Beautiful location with excellent amenities. The staff was friendly and helpful. Only minor issue was the Wi-Fi signal strength in some areas.",
                  avatar: "/assets/placeholder_hero.jpg"
                }
              ].map((review, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200" style={{ backgroundImage: `url(${review.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div>
                      <div className="font-semibold text-gray-900">{review.name}</div>
                      <div className="text-xs text-gray-600">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, idx) => (
                      <svg key={idx} className={`w-4 h-4 ${idx < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Overall Rating Summary */}
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Overall Rating</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-[var(--color-primary)]">4.8</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <svg key={idx} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">Based on 127 reviews</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors">
                  Write a Review
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailPage;

