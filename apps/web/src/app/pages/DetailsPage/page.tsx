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
const StaticMap = dynamic(() => import('./components/StaticMap').then(mod => mod.default), { ssr: false });
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
                        : "bg-[var(--color-danger-darkest)] text-white"
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

                <div>
                  <p className="text-gray-700 leading-relaxed">
                    Escape the ordinary and immerse yourself in nature without sacrificing comfort at {currentPlace.Title}.
                    Nestled in {fullAddress}, our unique experience offers the perfect blend of rustic charm and modern luxury.
                  </p>
                </div>

                <div>
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

              <div>
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

              <div>
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
                    className="px-6 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"                  >
                    Show all (+23)
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-[var(--color-background-tertiary)] px-6">
            <div className="rounded-lg mt-6">
              <div className="w-full h-full bg-gray-200 rounded-lg relative">
                <div className="space-y-6">
                  <div className="h-full">
                    {currentPlace?.Latitude && currentPlace?.Longitude ? (
                      <StaticMap
                        latitude={currentPlace.Latitude}
                        longitude={currentPlace.Longitude}
                        zoom={14}
                        className="w-full h-full"
                        markerColor="#C25128"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Location not available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-3 justify-end">
                <div className="w-10 h-10 bg-white rounded"></div>
                <div className="w-10 h-10 bg-white rounded"></div>
                <div className="w-10 h-10 bg-white rounded"></div>
              </div>
            </div>

            <div className="rounded-lg space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <img src="/assets/Icons/Location.svg" alt="Location" className="w-5 h-5 text-blue-600" />
                3902 Sunshine Palm Way, Kissimmee, FL 34747
              </div>
              <div className="flex items-center gap-2">
                <img src="/assets/Icons/Call.svg" alt="Call" className="w-5 h-5 text-blue-600" />
                3902 Sunshine Palm Way, Kissimmee, FL 34747                901-745-0354
              </div>
              <div className="flex items-center gap-2">
                <img src="/assets/Icons/World.svg" alt="World" className="w-5 h-5 text-blue-600" />
                <a
                  href="https://www.starlight.com/EmberNights"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.starlight.com/EmberNights
                </a>
              </div>

              <div className="flex gap-3 pt-2">
                <img src="/icons/facebook.svg" alt="facebook" className="w-6 h-6" />
                <img src="/icons/x.svg" alt="x" className="w-6 h-6" />
                <img src="/icons/instagram.svg" alt="instagram" className="w-6 h-6" />
                <img src="/icons/youtube.svg" alt="youtube" className="w-6 h-6" />
                <img src="/icons/tripadvisor.svg" alt="tripadvisor" className="w-6 h-6" />
                <img src="/icons/yelp.svg" alt="yelp" className="w-6 h-6" />
              </div>
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            <div className="rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Hours</h3>
              <p className="text-sm text-gray-700">Monday - Friday (8 AM to 6 PM)</p>
              <p className="text-sm text-gray-700">Saturday - Sunday (8 AM to 10 PM)</p>
            </div>

            <div className="border-t border-gray-300 my-4 px-6"></div>

            <div className="rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--color-secondary)] rounded-full"></span>
                  Special Event Booking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--color-secondary)] rounded-full"></span>
                  Tours
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--color-secondary)] rounded-full"></span>
                  Classes and Education
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--color-secondary)] rounded-full"></span>
                  Group Events
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            <div className="rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Local Weather</h3>
              <div className="bg-[var(--color-border-primary)] rounded-lg p-5 text-white space-y-2">
                <div className="text-3xl font-bold">24°</div>
                <div className="text-sm">Ocala County</div>
                <div className="text-xs">09:30 • 03/08</div>
                <div className="flex justify-between items-center pt-3 text-sm">
                  <span>Today</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                  <span>Mon</span>
                </div>
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
