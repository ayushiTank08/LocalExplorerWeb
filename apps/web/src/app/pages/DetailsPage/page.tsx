"use client";
import React, { Suspense, useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';

const WeatherWidget = dynamic(
  () => import('@/app/components/WeatherWidget/WeatherWidget'),
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
import { decryptData } from "@/utils/encryption";
import CheckInModal from '@/app/components/CheckInModal/CheckInModal';
import { LOCATION_CONFIG } from "@/config/location.config";

const Slider = dynamic(() => import('./components/Slider').then(mod => mod.Slider), { ssr: false });
const StaticMap = dynamic(() => import('./components/StaticMap').then(mod => mod.default), { ssr: false });
const { NotFoundState } = {
  NotFoundState: dynamic(() => import('./components/PlaceState').then(mod => mod.NotFoundState), { ssr: false })
};

const placesSelector = (state: RootState) => state.places;

function DetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  
  const handleCheckIn = async (message: string, photo?: File) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Promise.resolve();
    } catch (error) {
      console.error('Check-in failed:', error);
      return Promise.reject(error);
    }
  };
  const { places, categories, selectedPlace: currentPlace } = useAppSelector(placesSelector);
  const locationDetails = useAppSelector(selectLocationDetails);
  const isLocationDetailsLoading = useAppSelector(selectLocationDetailsLoading);
  const locationDetailsError = useAppSelector(selectLocationDetailsError);
  const dispatch = useAppDispatch();
  
  const activities = useMemo(() => {
    if (locationDetails?.Activities) {
      return locationDetails.Activities;
    }
    if (currentPlace?.Activities) {
      return currentPlace.Activities;
    }
    return [];
  }, [locationDetails, currentPlace]);
  
  const currentPlaceFromUrl = useMemo(() => {
    if (!id || !places?.length) return null;
    return places.find(p => p.Id.toString() === id) || null;
  }, [id, places]);

  useEffect(() => {
  }, [id, places, currentPlace]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [areImagesLoaded, setAreImagesLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stamped, setStamped] = useState<boolean>(locationDetails?.Stamped || false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const reduxState = useAppSelector(state => state);
  const coupons = useAppSelector(selectCoupons);
  // const deals = useAppSelector(selectDeals);
  const dealsAndCouponsLoading = useAppSelector(selectDealsAndCouponsLoading);
  const dealsAndCouponsError = useAppSelector(selectDealsAndCouponsError);

  const formatDescriptionWithReadMore = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    
    const uniqueId = `desc-${Math.random().toString(36).substr(2, 9)}`;
    
    if (text.length <= maxLength) {
      return text;
    }
    
    const shortText = text.substring(0, maxLength) + '...';
    return `
      <div class="relative">
        <div id="short-${uniqueId}" class="block">
          ${shortText}
          <button onclick="
            const short = document.getElementById('short-${uniqueId}');
            const full = document.getElementById('full-${uniqueId}');
            if (short && full) {
              short.classList.add('hidden');
              full.classList.remove('hidden');
            }
          " class="text-[var(--color-secondary)] font-medium ml-1 cursor-pointer">Read More</button>
        </div>
        <div id="full-${uniqueId}" class="hidden">
          ${text}
          <button onclick="
            const short = document.getElementById('short-${uniqueId}');
            const full = document.getElementById('full-${uniqueId}');
            if (short && full) {
              short.classList.remove('hidden');
              full.classList.add('hidden');
            }
          " class="text-[var(--color-secondary)] font-medium mt-1 block cursor-pointer">Show Less</button>
        </div>
      </div>
    `;
  };

  const formatCouponDescription = (description: string) => {
    if (!description) return '';
    
    const [beforePipe, ...afterPipeParts] = description.split('|');
    const afterPipe = afterPipeParts.join('|').trim();
    const promoCodeRegex = /(Promo Code:?\s*[A-Z0-9]+)/i;
    const promoCodeMatch = beforePipe.match(promoCodeRegex);
    
    let result = [];
    if (promoCodeMatch) {
      result.push(`<div class="flex justify-center"><span class="text-lg font-bold text-[var(--color-secondary)] px-4 rounded-full">${promoCodeMatch[0]}</span></div>`);
      
      const afterPromoCode = beforePipe.slice(promoCodeMatch.index! + promoCodeMatch[0].length).trim();
      if (afterPromoCode) {
        result.push(`<div class="text-sm text-[var(--color-secondary)]">${afterPromoCode}</div>`);
      }
    } else if (beforePipe.trim()) {
      result.push(`<div class="text-sm text-[var(--color-secondary)]">${beforePipe.trim()}</div>`);
    }
    
    if (afterPipe) {
      const formattedText = (afterPipe);
      result.push(`<div class="mt-2">${formattedText}</div>`);
    }
    
    return result.join('');
  };
  
  useEffect(() => {
  }, [coupons, deals, dealsAndCouponsLoading, dealsAndCouponsError]);
  const [isLoading, setIsLoading] = useState(true);

  const handleCall = useCallback(() => {
    if (locationDetails?.Phone) {
      window.location.href = `tel:${locationDetails.Phone}`;
    }
  }, [locationDetails?.Phone]);

  const handleDirections = useCallback(() => {
    if (locationDetails?.Latitude && locationDetails?.Longitude) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const url = isMobile 
        ? `https://www.google.com/maps/dir/?api=1&destination=${locationDetails.Latitude},${locationDetails.Longitude}`
        : `https://www.google.com/maps?q=${locationDetails.Latitude},${locationDetails.Longitude}`;
      window.open(url, '_blank');
    }
  }, [locationDetails?.Latitude, locationDetails?.Longitude]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: locationDetails?.Name || 'Location',
      text: `Check out ${locationDetails?.Name} on LocalExplorer`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  }, [locationDetails?.Name]);

  const locationId = useMemo(() => id ? parseInt(id) : null, [id]);
  const [isPinned, setIsPinned] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const handlePin = useCallback(() => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    if (locationId) {
      const pinnedLocations = JSON.parse(localStorage.getItem('pinnedLocations') || '{}');
      if (newPinnedState) {
        pinnedLocations[locationId] = true;
      } else {
        delete pinnedLocations[locationId];
      }
      localStorage.setItem('pinnedLocations', JSON.stringify(pinnedLocations));
    }
  }, [isPinned, locationId]);
  
  const handleLike = useCallback(() => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (locationId) {
      const likedLocations = JSON.parse(localStorage.getItem('likedLocations') || '{}');
      if (newLikedState) {
        likedLocations[locationId] = true;
      } else {
        delete likedLocations[locationId];
      }
      localStorage.setItem('likedLocations', JSON.stringify(likedLocations));
    }
  }, [isLiked, locationId]);
  
  useEffect(() => {
    if (locationId) {
      const pinnedLocations = JSON.parse(localStorage.getItem('pinnedLocations') || '{}');
      setIsPinned(!!pinnedLocations[locationId]);
      
      const likedLocations = JSON.parse(localStorage.getItem('likedLocations') || '{}');
      setIsLiked(!!likedLocations[locationId]);
    }
  }, [locationId]);

  const useAuthStatus = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
      const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        setIsLoggedIn(!!token);
      };
      
      checkAuth();
      
      const handleLogin = () => checkAuth();
      
      window.addEventListener('login', handleLogin);
      window.addEventListener('storage', checkAuth);
      
      return () => {
        window.removeEventListener('login', handleLogin);
        window.removeEventListener('storage', checkAuth);
      };
    }, []);
    
    return mounted ? isLoggedIn : false;
  };
  
  const isUserLoggedIn = useAuthStatus();

  const actionButtons = [
    { 
      icon: "/assets/Location_Details_Logos/Phone.svg", 
      alt: "Call",
      onClick: handleCall,
      disabled: !locationDetails?.Phone
    },
    { 
      icon: "/assets/Location_Details_Logos/Ways.svg", 
      alt: "Directions",
      onClick: handleDirections,
      disabled: !(locationDetails?.Latitude && locationDetails?.Longitude)
    },
    { 
      icon: "/assets/Location_Details_Logos/Share.svg", 
      alt: "Share",
      onClick: handleShare
    },
    ...(isUserLoggedIn ? [
      { 
        icon: "/assets/Location_Details_Logos/Save.svg", 
        alt: "Save",
        onClick: () => console.log('Save clicked')
      },
      { 
        icon: isLiked ? "/assets/Location_Details_Logos/Like.svg" : "/assets/Location_Details_Logos/Like.svg", 
        alt: "Like",
        onClick: handleLike
      },
      { 
        icon: isPinned ? "/assets/Location_Details_Logos/Pin.svg" : "/assets/Location_Details_Logos/Pin.svg", 
        alt: "Pin",
        onClick: handlePin
      }
    ] : [])
  ];


  useEffect(() => {
    const fetchData = async () => {
      if (!locationId) return;
      
      try {
        setIsLoading(true);
        
        if (currentPlaceFromUrl) {
          dispatch(setSelectedPlace(currentPlaceFromUrl));
        }

        await Promise.all([
          dispatch(fetchLocationDetails({ 
            locationId, 
            customerId: LOCATION_CONFIG.CUSTOMER_ID 
          })).unwrap().then((data) => {
            setStamped(data?.Stamped || false);
          }),
          dispatch(fetchDealsAndCoupons({ 
            locationId, 
            customerId: LOCATION_CONFIG.CUSTOMER_ID 
          }))
        ]);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      dispatch(setSelectedPlace(null));
    };
  }, [locationId, dispatch, currentPlaceFromUrl]);
  
  useEffect(() => {
  }, [locationDetails]);

  useEffect(() => {
    return () => {
      dispatch({ type: 'locationDetails/clearLocationDetails' });
    };
  }, [dispatch]);

  interface PlaceWithCategory extends Partial<Omit<Place, 'Category'>> {
    Category?: string | number;
    Address?: string;
    City?: string;
    State?: string;
    ZipCode?: string;
  }

  const getCategoryNames = useCallback((place: PlaceWithCategory): string[] => {
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

  const getFullAddress = useCallback((place: PlaceWithCategory | null): string => {
    if (!place) return '';
    const parts = [place.Address, place.City, place.State, place.ZipCode].filter(Boolean);
    return parts.join(', ');
  }, []);

  const { images, categoryNames, fullAddress } = useMemo(() => {
    const place = locationDetails || currentPlace;
    
    if (!place) {
      return {
        images: ['/assets/placeholder_hero.jpg'],
        categoryNames: [] as string[],
        fullAddress: ''
      };
    }

    const locationImages = (locationDetails?.Images && locationDetails.Images.length > 0) 
      ? locationDetails.Images 
      : [place.Image || '/assets/placeholder_hero.jpg'];

    return {
      images: locationImages,
      categoryNames: getCategoryNames(place),
      fullAddress: getFullAddress(place)
    };
  }, [locationDetails, currentPlace, getCategoryNames, getFullAddress]);

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

  const placeToRender = locationDetails || currentPlace;
  
  if (!placeToRender) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen">
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onCheckIn={handleCheckIn}
        locationName={locationDetails?.Title || currentPlace?.Title || ''}
      />
      <div className="max-w-[1440px] flex justify-center mx-auto">
        <div className="mx-auto py-6 px-6 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${(placeToRender?.Image || (locationDetails?.Images && locationDetails.Images.length > 0)) ? 'space-y-6' : 'space-y-0'}`}>
              <div className="relative">
                {(placeToRender?.Image || (locationDetails?.Images && locationDetails.Images.length > 0)) && (
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
              {activities?.length > 3 && (
                <div className="absolute bottom-4 right-4 z-10">
                  <Button
                    className="bg-white/90 backdrop-blur-sm rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors cursor-pointer"
                    onClick={() => {
                      const validActivities = activities.filter(act => !!act.PhotoURL?.trim());
                      setIsGalleryOpen(true);
                    }}
                  >
                    {(() => {
                      const total = activities.filter(act => !!act.PhotoURL?.trim()).length;
                      return total > 3
                        ? `Show all (+${total - 3})`
                        : `Show all (${total})`;
                    })()}
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
                      onClick={() => setIsCheckInModalOpen(true)}
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
                        onClick={btn.onClick}
                        className={`group flex items-center rounded-full border ${btn.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} border-[var(--color-neutral)]
                          transition-all duration-300 overflow-hidden 
                          w-[40px] sm:w-[47px] hover:w-auto ${btn.disabled ? '' : 'hover:bg-gray-50'}`}
                        title={btn.alt}
                        aria-label={btn.alt}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && !btn.disabled && btn.onClick()}
                        style={btn.disabled ? { pointerEvents: 'none' } : {}}
                      >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 flex justify-center items-center flex-shrink-0">
                          <img 
                            src={btn.icon} 
                            alt={btn.alt} 
                            className="w-5 h-5" 
                            style={{ filter: btn.disabled ? 'grayscale(100%)' : 'none' }}
                          />
                        </div>

                        <span
                          className={`whitespace-nowrap text-[var(--color-neutral)] text-xs sm:text-sm opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300 ml-2 pr-3 ${btn.disabled ? 'text-gray-400' : ''}`}
                        >
                          {btn.alt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {isLocationDetailsLoading ? (
                  <div className="flex justify-center py-4">
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
                       {locationDetails.Events.slice(0, 6).map((event: any) => {
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
                                      .substring(0, 70) + (event.Description.length > 70 ? '...' : '')
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
                  <div className="text-center text-gray-500">
                    No upcoming events at this time.
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 my-8"></div>

              <div id="passes">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Passes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-29">
                  {passes.map((pass, index) => (
                    <div
                      key={index}
                      className="flex rounded-lg overflow-hidden relative min-h-[128px] max-w-[385px]"
                    >
                      <div
                        className={`w-15 flex items-center shadow-xl justify-center font-bold text-xl ${pass.textColor} ${pass.bgLight}`}
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
                              className={`absolute bottom-0 right-0 w-[69%] text-white font-bold text-xl ${pass.bgColor} rounded-l-full px-6 py-1`}
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
                    View More Passes
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
                    <div key={deal.id} className="bg-white rounded-2xl overflow-hidden shadow-sm h-[299px]">
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
                      <div className="p-4 flex flex-col">
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
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed flex-grow">
                          {deal.description.split(" ").slice(0, 8).join(" ")}
                          {deal.description.split(" ").length > 8 && "..."}
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
                    View More Deals
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="mb-8">
                <div className="border-t border-gray-200 my-8"></div>
                {dealsAndCouponsLoading ? (
                  <div className="text-center py-4">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                  <div className="text-center text-gray-500">No coupons available at this time.</div>
                ) : (
                  <div id="coupons">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Coupons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {coupons.map((coupon) => (
                            <div key={coupon.Id} className="rounded-lg overflow-hidden">
                              {coupon.Logo ? (
                                <div className="mt-2 border-x border-t border-dashed border-gray-300 rounded-t-lg p-4 space-y-2">
                                  <img
                                    src={coupon.Logo}
                                    alt={coupon.Title}
                                    className="mx-auto object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="bg-[#F6E1B7] relative p-1">
                                  <div className="border border-dashed border-[var(--color-secondary)] rounded p-5.5 text-center">
                                    <h4 className="text-xl font-bold text-[var(--color-secondary)]">
                                      {coupon.Title}
                                    </h4>
                                    <div className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center">
                                      <img src="/assets/Icons/Scissors.svg" alt="Coupon" className="w-6 h-6" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="border-x border-b border-dashed border-gray-300 rounded-b-lg px-4 pb-4 pt-0 space-y-2">
                                <div className="text-sm text-gray-700">
                                  <div
                                    className="text-sm mt-2 cursor-pointer"
                                    dangerouslySetInnerHTML={{ 
                                      __html: (coupon.Description ?? "")
                                    }}
                                  />
                                  {coupon.CouponProgramDescription && (
                                    <div
                                      className="text-sm leading-relaxed mt-2 cursor-pointer"
                                      dangerouslySetInnerHTML={{ 
                                        __html: formatDescriptionWithReadMore(coupon.CouponProgramDescription) 
                                      }}
                                    />
                                  )}
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

                  {activities?.length > 0 && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex -space-x-2">
                        {activities
                          .filter(act => act.Comment?.trim())
                          .slice(0, 5)
                          .map((activity, index) => (
                            <div
                              key={index}
                              className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                            >
                            {activity.Profile ? (
                              <img
                                src={activity.Profile}
                                alt="User"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-sm">
                                {(activity.FirstName?.[0] || "U").toUpperCase()}
                              </div>
                            )}
                          </div>
                          ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Loved by <span className="font-semibold">{activities.length}+</span> customers
                      </p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                  {activities
                    .filter(
                      activity =>
                        activity.Comment?.trim() &&
                        activity.Comment.toLowerCase() !== "giveaway"
                    )
                    .slice(0, 5)
                    .map(activity => {
                      const formattedDate = activity.CreatedDate
                        ? new Date(activity.CreatedDate * 1000).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "";

                      const decryptedFirstName = activity.FirstName
                        ? decryptData(activity.FirstName)
                        : "User";
                      const decryptedLastName = activity.LastName
                        ? decryptData(activity.LastName)
                        : "";

                      return (
                        <div
                          key={activity.Id}
                          className="w-full bg-white border rounded-lg p-4 flex flex-col md:flex-row gap-4"
                          style={{ borderColor: "#E7EAEC" }}
                        >
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-600">
                                {decryptedFirstName?.[0]?.toUpperCase() || "U"}
                              </div>
                              <p className="text-sm text-gray-700">
                                <span className="font-medium text-gray-900">
                                  {decryptedFirstName} {decryptedLastName}
                                </span>{" "}
                                has checked in at{" "}
                                <span className="text-[var(--color-secondary)] font-medium cursor-pointer">
                                  {locationDetails?.Address || 'this location'}
                                </span>
                              </p>
                            </div>

                            {activity.PhotoURL && (
                              <div className="mt-3 md:hidden">
                                <img
                                  src={activity.PhotoURL}
                                  alt="User post"
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            )}

                            <div className="mt-2 text-gray-800 text-sm md:ml-12">
                              {activity.Comment}
                            </div>

                            <div className="mt-4 flex items-center gap-6 text-gray-500 text-sm flex-wrap md:ml-12">
                              <button 
                                className={`flex items-center gap-2 ${isLiked ? 'text-[var(--color-secondary)]' : 'text-gray-500 hover:text-[var(--color-primary)]'} relative cursor-pointer`}
                                onClick={handleLike}
                              >
                                <div className="relative w-6 h-6">
                                  <img 
                                    src="/assets/Icons/Like.svg" 
                                    alt="Like" 
                                    className={`w-full h-full ${isLiked ? 'opacity-0' : 'opacity-100'}`}
                                  />
                                  <div className={`absolute inset-0 w-full h-full ${isLiked ? 'opacity-100' : 'opacity-0'}`}>
                                    <img 
                                      src="/assets/Icons/Like.svg" 
                                      alt="Liked" 
                                      className="w-full h-full"
                                      style={{ filter: 'invert(0.5) sepia(1) saturate(5) hue-rotate(175deg)' }}
                                    />
                                  </div>
                                </div>
                                {/* <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-[10px] font-semibold px-2 py-1 rounded-full">{activity.LikeCount}</span> */}
                              </button>
                              <button className="flex items-center gap-2 hover:text-[var(--color-primary)] relative cursor-pointer">
                                <img src="/assets/Icons/Comment.svg" alt="Comment" className="w-6 h-6" />
                                <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-[10px] font-semibold px-2 py-1 rounded-full">{activity.CommentCount}</span>
                              </button>
                              <button 
                                className={`flex items-center gap-2 ${isPinned ? 'text-[var(--color-secondary)]' : 'text-gray-500 hover:text-[var(--color-primary)]'} cursor-pointer`}
                                onClick={handlePin}
                              >
                                <div className="relative w-4 h-4">
                                  <img 
                                    src="/assets/Icons/Red-flag.svg" 
                                    alt="Pin" 
                                    className={`w-full h-full ${isPinned ? 'opacity-0' : 'opacity-100'}`}
                                  />
                                  <div className={`absolute inset-0 w-full h-full ${isPinned ? 'opacity-100' : 'opacity-0'}`}>
                                    <img 
                                      src="/assets/Icons/Red-flag.svg" 
                                      alt="Pinned" 
                                      className="w-full h-full"
                                      style={{ filter: 'invert(0.5) sepia(1) saturate(5) hue-rotate(175deg)' }}
                                    />
                                  </div>
                                </div>
                              </button>
                              <input
                                type="text"
                                placeholder="Add a comment ..."
                                className="flex-1 rounded px-3 py-1 text-sm
                                  border border-transparent
                                  hover:border-gray-300
                                  focus:border-gray-300
                                  focus:ring-1 focus:ring-gray-300
                                  transition-colors"
                              />
                            </div>
                          </div>
                          {activity.PhotoURL && (
                            <div className="hidden md:block w-40 flex-shrink-0">
                              <img
                                src={activity.PhotoURL}
                                alt="User post"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {activities.filter(
                    act => act.Comment?.trim() && act.Comment.toLowerCase() !== "giveaway"
                  ).length === 0 && (
                      <div className="text-center text-gray-500">
                        No comments yet. Be the first to share your experience!
                      </div>
                    )}
                </div>

                {activities.filter(
                  activity => activity.Comment?.trim() && activity.Comment.toLowerCase() !== "giveaway"
                ).length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      className="px-6 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"
                    >
                      {(() => {
                        const totalActivities = activities.length;
                        const remaining = Math.max(0, totalActivities - 5);
                        return remaining > 0 ? `Show all (+${remaining})` : '';
                      })()}
                        </Button>
                      </div>
                    )}

                  <div className="flex justify-center">
                    <Button
                      className="gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--color-success-600)] text-white rounded font-semibold transition-colors cursor-pointer mt-4"
                      onClick={() => setIsCheckInModalOpen(true)}
                    >
                      <img
                        src="/assets/Icons/Check-in.svg"
                        alt="Check-In"
                        className="w-8 h-8 sm:w-8 sm:h-6"
                      />
                      <span className="text-sm sm:text-base">Check-In</span>
                    </Button>
                  </div>

                  {isGalleryOpen && (
                    <ImageGalleryPopup
                      isOpen={isGalleryOpen}
                    onClose={() => setIsGalleryOpen(false)}
                    activities={activities.filter(act => act.PhotoURL?.trim())}
                    locationName={placeToRender?.Title || 'Location'}
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
                    {(() => {
                      const lat = locationDetails?.Latitude || 
                                locationDetails?.locationLatitude ||
                                locationDetails?.location?.Latitude ||
                                currentPlace?.Latitude;
                      
                      const lng = locationDetails?.Longitude || 
                                locationDetails?.locationLongitude ||
                                locationDetails?.location?.Longitude ||
                                currentPlace?.Longitude;
                                            
                      if (lat && lng) {
                        return (
                          <div className="w-full h-[300px] rounded-lg">
                            <StaticMap
                              latitude={lat}
                              longitude={lng}
                              zoom={14}
                            />
                          </div>
                        );
                      }
                      
                      return (
                        <div className="h-[300px] bg-gray-100 flex items-center justify-center rounded-lg">
                          <div className="text-center">
                            <p className="text-gray-500">Map not available</p>
                            <p className="text-xs text-gray-400 mt-1">No coordinates found for this location</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
              {/* <div className="flex gap-3 mt-3 justify-end">
                <div className="w-10 h-10 bg-white rounded"></div>
                <div className="w-10 h-10 bg-white rounded"></div>
                <div className="w-10 h-10 bg-white rounded"></div>
              </div> */}
            </div>

            <div className="rounded-lg space-y-3 text-sm text-gray-700">
              {placeToRender?.Address && (
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
                    {[placeToRender.Address, placeToRender.City, placeToRender.State, placeToRender.ZipCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {placeToRender?.Phone && (
                <div className="flex items-center gap-2">
                  <img src="/assets/Icons/Call.svg" alt="Call" className="w-5 h-5 text-blue-600" />
                  <a href={`tel:${placeToRender.Phone.replace(/[^0-9+]/g, '')}`} className="hover:underline">
                    {placeToRender.Phone}
                  </a>
                </div>
              )}
              {placeToRender?.WebSite && (
                <div className="flex items-center gap-2">
                  <img src="/assets/Icons/World.svg" alt="Website" className="w-5 h-5 text-blue-600" />
                  <a
                    href={placeToRender.WebSite.startsWith('http') ? placeToRender.WebSite : `https://${placeToRender.WebSite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {placeToRender.WebSite.replace(/^https?:\/\//, '')}
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
                <div className="border-t border-gray-300 my-4"></div>
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
                  <WeatherWidget location={placeToRender?.City || 'Ocala'} />
                </div>
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
