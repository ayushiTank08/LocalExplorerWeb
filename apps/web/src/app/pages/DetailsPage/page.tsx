"use client";
import React, { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useAppSelector } from '../../../store/hooks';
import type { RootState } from '../../../store';
import type { Place } from '../../../store/slices/placesSlice';
import { amenities, passes, events, deals, coupons } from './detailsPageData';
import { Button } from "@nextforge/ui";

const ImageGallery = dynamic(() => import('./components/ImageGallery').then(mod => mod.ImageGallery), { ssr: false });
const { NotFoundState } = {
  NotFoundState: dynamic(() => import('./components/PlaceState').then(mod => mod.NotFoundState), { ssr: false })
};

const placesSelector = (state: RootState) => state.places;

function DetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const { places, categories } = useAppSelector(placesSelector);
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stamped, setStamped] = useState(false);

  const foundPlace = useMemo(() => {
    if (!id || places.length === 0) return null;
    return places.find(p => p.Id.toString() === id) || null;
  }, [id, places]);

  useEffect(() => {
    setCurrentPlace(foundPlace);
  }, [foundPlace]);

  const getCategoryNames = useCallback((place: Place): string[] => {
    if (!place?.Category || !categories) return [];

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
  }, [categories]);

  const getFullAddress = useCallback((place: Place | null): string => {
    if (!place) return '';
    const parts = [place.Address, place.City, place.State, place.ZipCode].filter(Boolean);
    return parts.join(', ');
  }, []);

  const { images, categoryNames, fullAddress } = useMemo(() => {
    if (!currentPlace) {
      return {
        images: ['/assets/placeholder_hero.jpg'],
        categoryNames: [] as string[],
        fullAddress: ''
      };
    }
    
    return {
      images: [
        currentPlace.Image || currentPlace.Thumb || '/assets/placeholder_hero.jpg',
        '/assets/placeholder_hero.jpg',
        '/assets/placeholder_hero.jpg',
      ],
      categoryNames: getCategoryNames(currentPlace),
      fullAddress: getFullAddress(currentPlace)
    };
  }, [currentPlace, getCategoryNames, getFullAddress]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleImageSelect = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);
  
  if (!currentPlace) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-9xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery
              images={images}
              currentImageIndex={currentImageIndex}
              onImageChange={handleImageSelect}
            />

            <div className="bg-[var(--color-background)] p-8 rounded-lg">
              <div className="">
                <div className="flex flex-wrap gap-3 mb-6">
                   <Button
                    onClick={() => setStamped(true)}
                    disabled={stamped}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors
                    ${stamped
                        ? "bg-white text-[var(--color-success-600)]"
                        : "bg-[var(--color-danger-darkest)] text-white hover:bg-[var(--color-primary)]/90"
                      }`}
                  >
                    {stamped ? (
                      <>
                        <img src="/assets/Icons/Password-stamped.svg" alt="Stamped" className="w-8 h-8" />
                        <span className="text-lg">Passport Stamped</span>
                      </>
                    ) : (
                      <>
                        <img src="/assets/Icons/Stamp.svg" alt="Unstamped" className="w-8 h-8" />
                        <span className="text-base cursor-pointer">Stamp Passport</span>
                      </>
                    )}
                  </Button>
                  <Button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-success-600)] text-white rounded font-semibold transition-colors cursor-pointer">
                    <img src="/assets/Icons/Check-in.svg" alt="Check-In" className="w-8 h-8" />
                    <span className="text-base">Check-In</span>
                  </Button>
                  <div className="ml-auto flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </Button>
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
                    {amenities.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="w-6 h-6 object-contain"
                        />
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 my-8"></div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                      <div className="h-34 relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 text-white p-2 rounded-lg">
                          <div
                            className="group flex items-center gap-1 rounded-full bg-[#FE9B0E] 
        relative transition-all duration-300 overflow-hidden 
        w-[40px] hover:w-[110px] cursor-pointer"
                          >
                            <div className="flex w-10 h-10 justify-center items-center flex-shrink-0 text-white">
                              <img src="/assets/Icons/Ticket-white.svg" alt="Tickets" />
                            </div>
                            <span
                              className="whitespace-nowrap text-white text-sm opacity-0 
          group-hover:opacity-100 transition-opacity duration-300"
                            >
                              Tickets
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 bg-white/30 rounded-full">
                          <div className="flex w-8 h-8 justify-center items-center relative">
                            <img src="/assets/Icons/Pin-Icon-Btn.svg" alt="Pin" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col h-34">
                        <h3 className="font-semibold text-base text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed flex-grow line-clamp-2">
                          {event.location}
                        </p>
                        <div className="flex items-center mt-auto">
                          <div className="w-4 h-4 mr-2 flex-shrink-0">
                            <img src="/assets/Icons/Calendar.svg" alt="Date" className="w-4 h-4" />
                          </div>
                          <span className="text-[var(--color-secondary)] text-sm">
                            {event.date} <span className="text-sm text-[var(--color-neutral-500)]">{event.time}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button
                    variant="ghost"
                    className="text-[var(--color-primary)] font-medium hover:underline cursor-pointer p-0 h-auto"
                  >
                    Load more (+7)
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 my-8"></div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Passes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {passes.map((pass, index) => (
                    <div
                      key={index}
                      className="flex rounded-lg overflow-hidden relative min-h-[128px]"
                    >
                      <div
                        className={`w-15 flex items-center justify-center font-bold text-xl ${pass.textColor} ${pass.bgLight}`}
                        style={{
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                        }}
                      >
                        {pass.duration}
                      </div>

                      <div className="absolute left-15 top-0 bottom-0 w-px border-dashed border-l border-gray-300" />

                      <div className="absolute left-[60px] top-0 w-4 h-4 bg-white rounded-full border border-gray-300 -translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute left-[60px] bottom-0 w-4 h-4 bg-white rounded-full border border-gray-300 -translate-x-1/2 translate-y-1/2" />

                      <div className="flex-1 flex flex-col justify-between rounded-lg border border-[#D6D7D6] border-l-0">
                        <div className="p-4">
                          <div className="flex justify-center items-center gap-2 mb-1">
                            <svg
                              className={`w-6 h-6 ${pass.textColor}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className={`font-bold text-xl ${pass.textColor}`}>PASS</span>
                            <svg
                              className={`w-6 h-6 ${pass.textColor}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <h4 className="text-center text-gray-900 mb-3">{pass.name}</h4>
                        </div>

                        <div className="flex justify-center py-2 w-full">
                          <div className="relative w-full">
                            <div
                              className={`absolute bottom-0 right-0 w-[60%] text-white font-bold text-xl ${pass.bgColor} rounded-l-full px-6 py-1`}
                            >
                              {pass.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Button
                    variant="ghost"
                    className="text-[var(--color-primary)] font-medium hover:underline flex items-center gap-2 mx-auto cursor-pointer p-0 h-auto"
                  >
                    View all
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="mb-8">
                <div className="border-t border-gray-200 my-8"></div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Deals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deals.map((deal) => (
                    <div key={deal.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                      <div className="h-34 relative">
                        <img
                          src={deal.image}
                          alt={deal.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-white/30 rounded-full">
                          <div className="flex w-8 h-8 justify-center items-center relative">
                            <img src="/assets/Icons/Pin-Icon-Btn.svg" alt="Pin" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col h-34">
                        <h3 className="font-semibold text-base text-gray-900 mb-2">
                          {deal.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed flex-grow line-clamp-2">
                          {deal.location}
                        </p>
                        <div className="flex items-center mt-auto">
                          <div className="w-4 h-4 mr-2 flex-shrink-0">
                            <img src="/assets/Icons/Calendar.svg" alt="Date" className="w-4 h-4" />
                          </div>
                          <span className="text-[var(--color-secondary)] text-sm">
                            {deal.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button
                    variant="ghost"
                    className="text-[var(--color-primary)] font-medium hover:underline flex items-center gap-2 mx-auto cursor-pointer p-0 h-auto"
                  >
                    View all
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="mb-8">
                <div className="border-t border-gray-200 my-8"></div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Coupons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map((coupon, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <div className="bg-[#F6E1B7] min-h-[130px] relative p-1">
                        <div className="border border-dashed border-[var(--color-secondary)] rounded p-5.5 text-center">
                          <h4 className="text-xl font-bold text-[var(--color-secondary)]">
                            {coupon.discount}
                          </h4>
                          <h5 className="text-xl font-semibold text-[var(--color-secondary)]">
                            {coupon.subtitle}
                          </h5>
                          <p className="text-sm text-[var(--color-secondary)]">{coupon.description}</p>

                          <div className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center">
                            <img src="/assets/Icons/Scissors.svg" alt="Group" className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                      <div className="border-x border-b border-dashed border-gray-300 rounded-b-lg p-4 space-y-2">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Expiration Date:</span>{" "}
                          <span className="font-bold">{coupon.expiration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)] font-medium">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-[15px]">{coupon.location}</span>
                        </div>

                        <div className="mt-4">
                          <Button
                            className="w-full bg-[var(--color-secondary)] text-white text-md py-2 rounded font-semibold hover:bg-[var(--color-secondary)]/90 transition-colors cursor-pointer"
                          >
                            Redeem Coupon
                          </Button>
                        </div>
                      </div>
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
                      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
                      hasImage: true,
                    },
                  ].map((post, index) => (
                    <div
                      key={index}
                      className="w-full bg-white border rounded-lg p-4"
                      style={{ borderColor: "#E7EAEC" }}
                    >
                      <div className="flex justify-between gap-4">
                        <div className="flex-1 pr-2">
                          <p className="text-sm text-gray-700">
                            has checked in at{" "}
                            <span className="text-[var(--color-secondary)] font-medium">{post.location}</span>{" "}
                            <span className="text-gray-500 text-xs">{post.time}</span>{" "}
                          </p>
                          <p className="mt-2 text-gray-800 text-sm">{post.content}</p>
                        </div>

                        {post.hasImage && (
                          <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 hover:text-[var(--color-primary)] p-1 h-auto"
                        >
                          <img src="/assets/Icons/Like.svg" alt="Like" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 hover:text-[var(--color-primary)]"
                        >
                          <img src="/assets/Icons/Comment.svg" alt="Comment" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 hover:text-[var(--color-primary)]"
                        >
                          <img src="/assets/Icons/Red-flag.svg" alt="Flag" className="w-4 h-4" />
                        </Button>
                        <input
                          type="text"
                          placeholder="Add a comment ..."
                          className="flex-1 border-b border-gray-300 text-sm px-2 py-1 
                          focus:outline-none focus:border-[var(--color-primary)] 
                          hover:border-gray-400 hover:bg-gray-50 transition"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    className="px-6 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                  >
                    Show all (+23)
                  </Button>
                </div>
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
                <Button
                  className="w-full bg-[var(--color-primary)] text-white py-2 rounded font-medium hover:bg-[var(--color-primary)]/90 transition-colors"
                >
                  Get Directions
                </Button>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 bg-blue-400 hover:bg-blue-500 text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-10 h-10 bg-red-600 hover:bg-red-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaceDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailsContent />
    </Suspense>
  );
}
