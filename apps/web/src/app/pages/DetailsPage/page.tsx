"use client";
import React, { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';

const WeatherWidget = dynamic(
  () => import('@/components/WeatherWidget/WeatherWidget'),
  { ssr: false }
);
import type { RootState } from '../../../store';
import type { Place } from '../../../store/slices/placesSlice';
import { setSelectedPlace } from '../../../store/slices/placesSlice';
import { fetchLocationDetails, fetchDealsAndCoupons, selectLocationDetails, selectLocationDetailsLoading, selectLocationDetailsError } from '../../../store/slices/locationDetailsSlice';
import { passes, events, deals, reviews } from './detailsPageData';
import { selectCoupons, selectDeals, selectDealsAndCouponsLoading, selectDealsAndCouponsError } from '../../../store/slices/locationDetailsSlice';
import { ImageGalleryPopup } from './components/ImageGalleryPopup';
import { Button } from "@nextforge/ui";

const Slider = dynamic(() => import('./components/Slider').then(mod => mod.Slider), { ssr: false });
const StaticMap = dynamic(() => import('./components/StaticMap').then(mod => mod.default), { ssr: false });
const { NotFoundState } = {
  NotFoundState: dynamic(() => import('./components/PlaceState').then(mod => mod.NotFoundState), { ssr: false })
};

const placesSelector = (state: RootState) => state.places;

function DetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const { places, categories, selectedPlace: currentPlace } = useAppSelector(placesSelector);
  const locationDetails = useAppSelector(selectLocationDetails);
  const isLocationDetailsLoading = useAppSelector(selectLocationDetailsLoading);
  const locationDetailsError = useAppSelector(selectLocationDetailsError);
  const dispatch = useAppDispatch();
  
  const activities = useMemo(() => {
    if (locationDetails?.Activities) {
      return locationDetails.Activities;
    }
    return currentPlace?.Activities || [];
  }, [locationDetails, currentPlace]);

  useEffect(() => {
  }, [id, places, currentPlace]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [stamped, setStamped] = useState<boolean>(locationDetails?.Stamped || false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const reduxState = useAppSelector(state => state);
  const coupons = useAppSelector(selectCoupons);
  // const deals = useAppSelector(selectDeals);
  const dealsAndCouponsLoading = useAppSelector(selectDealsAndCouponsLoading);
  const dealsAndCouponsError = useAppSelector(selectDealsAndCouponsError);
  
  useEffect(() => {
  }, [coupons, deals, dealsAndCouponsLoading, dealsAndCouponsError]);
  const [isLoading, setIsLoading] = useState(true);

  const actionButtons = [
    { icon: "/assets/Location_Details_Logos/Phone.svg", alt: "Call" },
    { icon: "/assets/Location_Details_Logos/Ways.svg", alt: "Directions" },
    { icon: "/assets/Location_Details_Logos/Share.svg", alt: "Share" },
    { icon: "/assets/Location_Details_Logos/Save.svg", alt: "Save" },
    { icon: "/assets/Location_Details_Logos/Like.svg", alt: "Like" },
    { icon: "/assets/Location_Details_Logos/Pin.svg", alt: "Pin" },
  ];

  const fetchPlaceById = useCallback(async (placeId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/places/${placeId}`);
      if (response.ok) {
        const data = await response.json();
        dispatch(setSelectedPlace(data));
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch place:', errorText);
        dispatch(setSelectedPlace(null));
      }
    } catch (error) {
      console.error('Error fetching place:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const foundPlace = useMemo(() => {
    if (!id || places.length === 0) return null;
    return places.find(p => p.Id.toString() === id) || null;
  }, [id, places]);

  useEffect(() => {
    if (id && places && places.length > 0) {
      const foundPlace = places.find(p => p.Id === parseInt(id));
      if (foundPlace) {
        dispatch(setSelectedPlace(foundPlace));
        setIsLoading(false);
        if (foundPlace.Id) {
          dispatch(fetchLocationDetails({ 
            locationId: foundPlace.Id, 
            customerId: 5588
          })).unwrap().then((data) => {
            // Update stamped state when location details are loaded
            setStamped(data?.Stamped || false);
          });
          
          dispatch(fetchDealsAndCoupons({ 
            locationId: foundPlace.Id, 
            customerId: 5588 
          }));
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [id, places, currentPlace, dispatch]);

  useEffect(() => {
    return () => {
      dispatch({ type: 'locationDetails/clearLocationDetails' });
    };
  }, [dispatch]);

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
        currentPlace.Image || '/assets/placeholder_hero.jpg',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!currentPlace) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen max-w-[1440px] flex justify-center mx-auto">
      <div className="mx-auto py-6 px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 ${currentPlace?.Image ? 'space-y-6' : 'space-y-0'}`}>
            <div className="relative">
              {currentPlace?.Image && (
                <Slider
                  images={images}
                  currentImageIndex={currentImageIndex}
                  onImageChange={handleImageSelect}
                  onImageClick={() => {
                    const validActivities = activities?.filter(act => !!act.PhotoURL?.trim()) || [];
                    setIsGalleryOpen(true);
                  }}
                />
              )}
              {activities?.length > 0 && (
                <div className="absolute bottom-4 right-4 z-10">
                  <Button 
                    className="bg-white/90 backdrop-blur-sm rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                    onClick={() => {
                      const validActivities = activities.filter(act => !!act.PhotoURL?.trim());
                      setIsGalleryOpen(true);
                    }}
                  >
                    Show all ({activities.filter(act => !!act.PhotoURL?.trim()).length})
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-[var(--color-background)] p-8 rounded-lg">
              <div className="">
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    onClick={() => setStamped(true)}
                    className={`flex items-center gap-2 
                      px-3 py-1.5 sm:px-4 sm:py-2 
                      rounded font-semibold transition-colors
                      ${stamped
                        ? "bg-white text-[var(--color-success-600)]"
                        : "bg-[var(--color-danger-darkest)] text-white"
                      }`}
                  >
                    {stamped ? (
                      <>
                        <img
                          src="/assets/Icons/Password-stamped.svg"
                          alt="Stamped"
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                        <span className="text-sm sm:text-lg">Passport Stamped</span>
                      </>
                    ) : (
                      <>
                        <img
                          src="/assets/Icons/Stamp.svg"
                          alt="Unstamped"
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                        <span className="text-sm sm:text-base cursor-pointer">Stamp Passport</span>
                      </>
                    )}
                  </Button>

                  <Button
                    className="flex items-center gap-2 
                      px-3 py-1.5 sm:px-4 sm:py-2 
                      bg-[var(--color-success-600)] text-white rounded font-semibold transition-colors cursor-pointer"
                  >
                    <img
                      src="/assets/Icons/Check-in.svg"
                      alt="Check-In"
                      className="w-6 h-6 sm:w-8 sm:h-8"
                    />
                    <span className="text-sm sm:text-base">Check-In</span>
                  </Button>

                  <div className="ml-auto flex gap-3">
                    {actionButtons.map((btn, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center rounded-full border border-[var(--color-neutral)]
                          transition-all duration-300 overflow-hidden 
                          w-[40px] sm:w-[47px] hover:w-auto cursor-pointer"
                      >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 flex justify-center items-center flex-shrink-0">
                          <img src={btn.icon} alt={btn.alt} className="w-5 h-5" />
                        </div>

                        <span
                          className="whitespace-nowrap text-[var(--color-neutral)] text-xs sm:text-sm opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300 ml-2 pr-3"
                        >
                          {btn.alt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {isLocationDetailsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                ) : locationDetailsError ? (
                  <div className="text-red-500 text-center py-4">
                    Failed to load location details
                  </div>
                ) : (
                  <>
                    {locationDetails?.Description && (
                      <div className="text-gray-700 leading-relaxed">
                        <div 
                          className="prose max-w-none space-y-4"
                          dangerouslySetInnerHTML={{ 
                            __html: locationDetails.Description
                              .replace(/<p>/g, '<p class="mb-6">')
                              .replace(/<p><\/p>/g, '')
                          }} 
                        />
                      </div>
                    )}

                    {locationDetails?.Amenities && locationDetails.Amenities.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900 mt-4 mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {locationDetails.Amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span>
                              <span className="text-gray-700 text-[15px]">{amenity.AmenitieName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-gray-200 my-8"></div>

              <div>
                {locationDetails?.Events && locationDetails.Events.length > 0 ? (
                  <div id="events">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {locationDetails.Events.map((event: any) => {
                        const eventDate = new Date(event.EventDate);
                        const formattedDate = eventDate.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        });
                        
                        let timeDisplay = '';
                        if (event.StartTime) {
                          timeDisplay = `(${event.StartTime}${event.EndTime ? `-${event.EndTime}` : ''})`;
                        }

                        return (
                          <div key={event.Id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                            <div className="h-48 relative">
                              {event.Images && event.Images.length > 0 ? (
                                <img
                                  src={event.Images[0]}
                                  alt={event.Title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500">No Image Available</span>
                                </div>
                              )}
                              {event.TicketURL && (
                                <div className="absolute top-0 left-0 text-white p-2 rounded-lg">
                                  <a
                                    href={event.TicketURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-1 rounded-full bg-[#FE9B0E] 
                                    relative transition-all duration-300 overflow-hidden 
                                    w-[40px] hover:w-[110px] cursor-pointer"
                                  >
                                    <div className="flex w-10 h-10 justify-center items-center flex-shrink-0 text-white">
                                      <img src="/assets/Icons/Ticket-white.svg" alt="Tickets" />
                                    </div>
                                    <span className="whitespace-nowrap text-white text-sm opacity-0 
                                    group-hover:opacity-100 transition-opacity duration-300">
                                      Tickets
                                    </span>
                                  </a>
                                </div>
                              )}
                              <div className="absolute top-3 right-3 bg-white/30 rounded-full">
                                <div className="flex w-8 h-8 justify-center items-center relative">
                                  <img src="/assets/Icons/Pin-Icon-Btn.svg" alt="Pin" />
                                </div>
                              </div>
                            </div>
                            <div className="p-4 flex flex-col h-48">
                              <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
                                {event.Title}
                              </h3>
                              {event.Description && (
                                <div 
                                  className="text-sm text-gray-600 mb-3 leading-relaxed flex-grow line-clamp-3"
                                  dangerouslySetInnerHTML={{ 
                                    __html: event.Description
                                      .replace(/<[^>]*>/g, '')
                                      .substring(0, 150) + (event.Description.length > 150 ? '...' : '')
                                  }} 
                                />
                              )}
                              <div className="flex items-center mt-auto">
                                <div className="w-4 h-4 mr-2 flex-shrink-0">
                                  <img src="/assets/Icons/Calendar.svg" alt="Date" className="w-4 h-4" />
                                </div>
                                <span className="text-[var(--color-secondary)] text-sm">
                                  {formattedDate} {timeDisplay && (
                                    <span className="text-sm text-[var(--color-neutral-500)]">{timeDisplay}</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {locationDetails.Events.length > 6 && (
                      <div className="text-center mt-8">
                        <Button
                          variant="ghost"
                          className="text-[var(--color-primary)] font-medium hover:underline cursor-pointer p-0 h-auto"
                        >
                          Load more (+{locationDetails.Events.length - 6})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming events at this time.
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 my-8"></div>

              <div id="passes">
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

              <div id="deals" className="mb-8">
                <div className="border-t border-gray-200 my-8"></div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Deals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deals.map((deal: any) => (
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
                        <div className="flex items-center">
                          <div className="w-4 h-4 mr-2 flex-shrink-0">
                            <img src="/assets/Icons/Calendar.svg" alt="Date" className="w-4 h-4" />
                          </div>
                          <span className="text-[var(--color-secondary)] text-sm">
                            {deal.date}
                          </span>
                        </div>
                        <div className="flex items-center mt-2">
                          <div className="w-4 h-4 mr-2 flex-shrink-0">
                            <img src="/assets/Icons/location-pin.svg" alt="Location" className="w-4 h-4" />
                          </div>
                          <span className="text-[var(--color-secondary)] text-sm">
                            {deal.location}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed flex-grow line-clamp-2">
                          {deal.description}
                        </p>
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
                {dealsAndCouponsLoading ? (
                  <div className="text-center py-8">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No coupons available at this time.</div>
                ) : (
                  <div id="coupons">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Coupons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map((coupon) => (
                      <div key={coupon.Id} className="rounded-lg overflow-hidden">
                        <div className="bg-[#F6E1B7] min-h-[130px] relative p-1">
                          <div className="border border-dashed border-[var(--color-secondary)] rounded p-5.5 text-center">
                            <h4 className="text-xl font-bold text-[var(--color-secondary)]">
                              {coupon.Title}
                            </h4>
                            <p className="text-sm text-[var(--color-secondary)] mt-2">{coupon.Description}</p>

                            {/* {coupon.Logo && (
                              <div className="mt-2">
                                <img 
                                  src={coupon.Logo} 
                                  alt={coupon.Title} 
                                  className="h-12 mx-auto object-contain"
                                />
                              </div>
                            )} */}

                            <div className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center">
                              <img src="/assets/Icons/Scissors.svg" alt="Coupon" className="w-6 h-6" />
                            </div>
                          </div>
                        </div>
                        <div className="border-x border-b border-dashed border-gray-300 rounded-b-lg p-4 space-y-2">
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">Expiration Date:</span>{" "}
                              <span className="font-bold">
                                {coupon.EndDate
                                  ? new Date(coupon.EndDate).toLocaleDateString()
                                  : "None"}
                              </span>
                            </div>
                          {(coupon.LocationName || coupon.City) && (
                            <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)] font-medium">
                              <img src="/assets/Icons/location-pin.svg" alt="Location" className="w-4 h-4" />
                              <span className="text-[15px]">
                                {[coupon.LocationName, coupon.City, coupon.Zip].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}

                          <div className="mt-4">
                            <Button
                              className="w-full bg-[var(--color-secondary)] text-white text-md py-2 rounded font-semibold hover:bg-[var(--color-secondary)]/90 transition-colors cursor-pointer"
                              disabled={coupon.IsRedeemed}
                            >
                              {coupon.IsRedeemed ? 'Redeemed' : 'Redeem Coupon'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                )}
              </div>

              <div className="mb-8" id="posts">
                <div className="border-t border-gray-200 my-8"></div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">What people say</h3>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex -space-x-2">
                    {[
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
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

                <div className="flex flex-col gap-2">
                  {reviews.map((post, index) => (
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

                      <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
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
                    onClick={() => {
                      const validActivities = activities.filter(act => {
                        const hasPhoto = !!act.PhotoURL?.trim();
                        return hasPhoto;
                      });
                      setIsGalleryOpen(true);
                    }}
                    className="px-6 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"
                  >
                    {`Show all (+23)`}
                  </Button>
                </div>

                {isGalleryOpen && (
                  <ImageGalleryPopup
                    isOpen={isGalleryOpen}
                    onClose={() => setIsGalleryOpen(false)}
                    activities={activities.filter(act => act.PhotoURL?.trim())}
                    locationName={currentPlace?.Title || locationDetails?.Title || 'Location'}
                  />
                )}
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
              {currentPlace?.Address && (
                <div>
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/Icons/Location.svg"
                      alt="Location"
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-medium">Address:</span>
                  </div>
                  <p className="text-gray-700 pl-7">
                    {[currentPlace.Address, currentPlace.City, currentPlace.State, currentPlace.ZipCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {currentPlace?.Phone && (
                <div className="flex items-center gap-2">
                  <img src="/assets/Icons/Call.svg" alt="Call" className="w-5 h-5 text-blue-600" />
                  <a href={`tel:${currentPlace.Phone.replace(/[^0-9+]/g, '')}`} className="hover:underline">
                    {currentPlace.Phone}
                  </a>
                </div>
              )}
              {currentPlace?.WebSite && (
                <div className="flex items-center gap-2">
                  <img src="/assets/Icons/World.svg" alt="Website" className="w-5 h-5 text-blue-600" />
                  <a
                    href={currentPlace.WebSite.startsWith('http') ? currentPlace.WebSite : `https://${currentPlace.WebSite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {currentPlace.WebSite.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              {/* <div className="flex gap-3 pt-2">
                <img src="/icons/facebook.svg" alt="facebook" className="w-6 h-6" />
                <img src="/icons/x.svg" alt="x" className="w-6 h-6" />
                <img src="/icons/instagram.svg" alt="instagram" className="w-6 h-6" />
                <img src="/icons/youtube.svg" alt="youtube" className="w-6 h-6" />
                <img src="/icons/tripadvisor.svg" alt="tripadvisor" className="w-6 h-6" />
                <img src="/icons/yelp.svg" alt="yelp" className="w-6 h-6" />
              </div> */}
            </div>

            {locationDetails?.CustomHours && (
              <>
              <div className="border-t border-gray-300 my-4"></div>
              <div className="rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hours</h3>
                <p
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: locationDetails.CustomHours.replace(/\r\n/g, "<br />")
                  }}
                />              
              </div>
              </>
            )}

            <div className="rounded-lg">
              {locationDetails?.Features && locationDetails.Features.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h3>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                    {locationDetails.Features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[var(--color-secondary)] rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            <div className="mb-6">
              <div className="rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Local Weather</h3>
                <div className="bg-[var(--color-border-primary)] rounded-lg p-5 text-white space-y-2">
                  <WeatherWidget location={currentPlace?.City || 'Ocala'} />
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
