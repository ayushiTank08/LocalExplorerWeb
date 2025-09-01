"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector } from '../../../store/hooks';
import type { RootState } from '../../../store';
import type { Place } from '../../../store/slices/placesSlice';

type SearchParams = { id?: string };

interface PlaceDetailPageProps {
  searchParams: SearchParams;
}

const PlaceDetailPage: React.FC<PlaceDetailPageProps> = ({ searchParams }) => {
  const id = searchParams?.id;
  const { places, categories } = useAppSelector((state: RootState) => state.places);
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id && places.length > 0) {
      const place = places.find(p => p.Id.toString() === id);
      setCurrentPlace(place || null);
    }
  }, [id, places]);

  const getCategoryNames = (place: Place): string[] => {
    if (!place.Category || !categories) return [];

    const nameById = new Map<number, string>();
    const walk = (node: any) => {
      if (node && typeof node.CategoryId === 'number') {
        nameById.set(node.CategoryId, node.CategoryName);
      }
      if (Array.isArray(node?.Categories)) {
        node.Categories.forEach(walk);
      }
    };
    categories.forEach(walk);

    const ids = String(place.Category)
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);

    return ids.map((id) => nameById.get(id)).filter(Boolean) as string[];
  };

  const getFullAddress = (place: Place): string => {
    const parts = [place?.Address, place?.City, place?.State, place?.ZipCode].filter(Boolean);
    return parts.join(', ');
  };

  if (!currentPlace) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-600 mb-2">Place not found</div>
          <div className="text-sm text-gray-500">The place you're looking for doesn't exist or has been removed.</div>
        </div>
      </div>
    );
  }

  const images = [
    currentPlace.Image || currentPlace.Thumb || '/assets/placeholder_hero.jpg',
    '/assets/placeholder_hero.jpg',
    '/assets/placeholder_hero.jpg',
  ];

  const categoryNames = getCategoryNames(currentPlace);
  const fullAddress = getFullAddress(currentPlace);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-lg overflow-hidden bg-white shadow-lg">
              <div className="h-80 bg-gray-300 relative">
                <img
                  src={images[currentImageIndex]}
                  alt={currentPlace.Title}
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      onClick={() => setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : images.length - 1)}
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      onClick={() => setCurrentImageIndex((prev) => prev < images.length - 1 ? prev + 1 : 0)}
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all ${i === currentImageIndex ? 'bg-[var(--color-primary)]' : 'bg-white/50'
                          }`}
                        onClick={() => setCurrentImageIndex(i)}
                      />
                    ))}
                  </div>
                )}

                <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-sm font-medium text-gray-700 hover:bg-white transition-colors">
                  Show all (+12)
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex flex-wrap gap-3 mb-6">
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded font-semibold hover:bg-[var(--color-primary)]/90 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Stamp Passport
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)] text-white rounded font-semibold hover:bg-[var(--color-secondary)]/90 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Check-In
                </button>

                <div className="ml-auto flex gap-2">
                  <button className="p-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="p-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                  <button className="p-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="p-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="p-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  Escape the ordinary and immerse yourself in nature without sacrificing comfort at {currentPlace.Title}.
                  Nestled in {fullAddress}, our unique experience offers the perfect blend of rustic charm and modern luxury.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categoryNames.slice(0, 6).map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[var(--color-secondary)] rounded-full"></div>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 my-8"></div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="h-32 bg-gray-200 relative">
                      <div className="absolute top-2 left-2 bg-[var(--color-primary)] text-white px-2 py-1 rounded text-xs">
                        Event
                      </div>
                      <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Event Title {index + 1}</h4>
                      <p className="text-sm text-gray-600 mb-2">{fullAddress}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Date and Time</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <button className="text-[var(--color-primary)] font-medium hover:underline">
                  Load more (+7)
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 my-8"></div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Passes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "1 Day Wine Tasting Pass", price: "$50.00", duration: "1 - Day" },
                  { name: "2 Day Wine Tasting Pass", price: "$99.00", duration: "2 - Days" }
                ].map((pass, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="flex">
                      <div className="w-16 bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <span className="text-[var(--color-primary)] font-bold text-sm">{pass.duration}</span>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">PASS</span>
                          <div className="flex gap-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{pass.name}</h4>
                        <div className="bg-[var(--color-primary)]/10 rounded-full px-3 py-1 inline-block">
                          <span className="font-bold text-[var(--color-primary)]">{pass.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <button className="text-[var(--color-primary)] font-medium hover:underline flex items-center gap-2 mx-auto">
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="border-t border-gray-200 my-8"></div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Deals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "Wine Wednesdays",
                    description: "1/2 off select pours every wednesday!",
                    location: "The Wine Emporium",
                    date: "Aug 01, 2024 To Oct 31, 2024"
                  },
                  {
                    title: "2-4-1 Draft Beers",
                    description: "Come visit us for a cold brew!",
                    location: "Sizzle & Savor Steakhouse",
                    date: "Started from 7/1/2024"
                  },
                  {
                    title: "$2 Taco Tuesdays",
                    description: "Huge savings on Tuesday! Celebrate Taco Tuesday with $2 tacos!",
                    location: "Hacienda",
                    date: "Jun 01, 2024 To Dec 31, 2024"
                  }
                ].map((deal, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-32 bg-gradient-to-r from-orange-100 to-red-100 relative flex items-center justify-center">
                      <div className="text-2xl font-bold text-[var(--color-primary)]">DEAL</div>
                      <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{deal.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{deal.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-primary)] mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>{deal.location}</span>
                      </div>
                      <p className="text-sm text-gray-600">{deal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <button className="text-[var(--color-primary)] font-medium hover:underline flex items-center gap-2 mx-auto">
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="border-t border-gray-200 my-8"></div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Coupons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "10% off Individual Tours",
                    description: "Requires advanced booking. Click \"Redeem\" for more info.",
                    location: "Horse Farms",
                    expiration: "None",
                    gradient: "from-yellow-50 to-orange-50 border-orange-200"
                  },
                  {
                    title: "15% off Cottage Rentals",
                    description: "Valid Monday-Thursday. Subject to Availability",
                    location: "Starlight Oasis Glamping",
                    expiration: "December 15, 2024",
                    gradient: "from-green-50 to-blue-50 border-blue-200"
                  }
                ].map((coupon, index) => (
                  <div key={index} className={`bg-gradient-to-r ${coupon.gradient} rounded-lg border-2 border-dashed p-6 relative overflow-hidden`}>
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/70 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h6M12 6h.01M12 18h.01" />
                      </svg>
                    </div>

                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-[var(--color-primary)] mb-2">{coupon.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Expiration Date:</span> {coupon.expiration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-primary)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>{coupon.location}</span>
                      </div>
                    </div>

                    <button className="w-full bg-[var(--color-primary)] text-white py-2 rounded font-semibold hover:bg-[var(--color-primary)]/90 transition-colors">
                      Redeem Coupon
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="border-t border-gray-200 my-8"></div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">What people say</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=40&h=40&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face"
                  ].map((avatar, index) => (
                    <div key={index} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                      <img src={avatar} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Loved by 100+ customers</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  {
                    user: "Sarah M.",
                    time: "3 hours ago",
                    content: "Always fresh pours!",
                    location: "Lake Oklawaha RV Park",
                    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
                    hasImage: true
                  },
                  {
                    user: "Mike C.",
                    time: "7 hours ago",
                    content: "Beers!",
                    location: "Lake Oklawaha RV Park",
                    hasImage: false
                  },
                  {
                    user: "Emily R.",
                    time: "a day ago",
                    content: "Always fresh pours!",
                    location: "Lake Oklawaha RV Park",
                    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop",
                    hasImage: true
                  },
                  {
                    user: "John D.",
                    time: "2 days ago",
                    content: "Great experience!",
                    location: "Lake Oklawaha RV Park",
                    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop",
                    hasImage: true
                  }
                ].map((post, index) => (
                  <div className="w-full max-w-2xl bg-white border border-#E7EAEC rounded-lg p-4">
                    <div className="flex justify-between">
                      {/* Left Content */}
                      <div className="flex-1 pr-4">
                        <p className="text-sm">
                          has checked in at{" "}
                          <span className="text-red-500 font-medium">Lake Oklawaha RV Park</span>{" "}
                          <span className="text-gray-500 text-xs">· 3 hours ago</span>
                        </p>
                        <p className="mt-2 text-gray-800">Always fresh pours!</p>
                      </div>

                      {/* Right Image */}
                      <div className="w-28 h-20 flex-shrink-0 rounded-md overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&h=200&fit=crop"
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
                      <button className="flex items-center gap-1 hover:text-[var(--color-primary)]">
                        👍
                      </button>
                      <button className="flex items-center gap-1 hover:text-[var(--color-primary)]">
                        💬
                      </button>
                      <button className="flex items-center gap-1 hover:text-[var(--color-primary)]">
                        ↗
                      </button>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 border-b border-gray-300 text-sm px-2 py-1 focus:outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </div>

                ))}
              </div>


              <div className="text-center mt-6">
                <button className="px-6 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                  Show all (+23)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20"></div>
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-sm font-semibold text-gray-900">Interactive Map</div>
                    <div className="text-xs text-gray-600 mt-1">{fullAddress}</div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <button className="w-full bg-[var(--color-primary)] text-white py-2 rounded font-medium hover:bg-[var(--color-primary)]/90 transition-colors">
                  Get Directions
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm text-gray-700">{currentPlace.Phone || 'N/A'}</span>
                </div>
                {currentPlace.WebSite && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <a href={currentPlace.WebSite} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">Open 24/7</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share This Place</h3>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </button>
                <button className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </button>
                <button className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailPage;
