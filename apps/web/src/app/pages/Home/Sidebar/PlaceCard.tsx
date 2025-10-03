import React from 'react';
import { Card } from "@nextforge/ui";
import { useRouter } from 'next/navigation';

interface LocationCardProps {
  id: string;
  title: string;
  address: string;
  imageUrl: string;
  facilities: string[];
  hasTicket?: boolean;
  hasEvents?: boolean;
  hasDeals?: boolean;
}

const PlaceCard: React.FC<LocationCardProps> = ({
  id,
  title,
  address,
  imageUrl,
  facilities,
  hasTicket = true,
  hasEvents = true,
  hasDeals = true
}) => {
  const router = useRouter();
  
  const handleSeeMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/pages/DetailsPage?id=${id}`);
  };
  const visibleFacilities = facilities.slice(0, 3);
  const hiddenFacilities = facilities.slice(3);
  const hiddenTitle = hiddenFacilities.join(", ");
  return (
    <Card className="flex w-full h-auto lg:w-[270px] h-[285px] pb-4 flex-col items-start gap-1 flex-shrink-0 rounded-lg bg-[var(--color-background)] relative">
      <div className="flex h-[135px] flex-col justify-end items-center gap-2.5 self-stretch relative rounded-t-lg overflow-hidden">
        {!imageUrl.startsWith('#') && (
          <>
            <div className="absolute inset-0">
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover blur-sm scale-105"
                aria-hidden="true"
              />
            </div>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={imageUrl}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </>
        )}
        {imageUrl.startsWith('#') && (
          <div className="absolute inset-0" style={{ backgroundColor: imageUrl }} />
        )}
        <div className="flex p-2.5 justify-center items-start gap-2.5 flex-1 self-stretch relative">
          <div className="flex flex-1 relative">
            <div className="flex gap-2.5 flex-1 relative">
              {hasTicket && (
                <div
                  className="group flex items-center gap-1 rounded-full bg-[var(--color-secondary)] 
          relative transition-all duration-300 overflow-hidden 
          w-[40px] hover:w-[110px] cursor-pointer"
                >
                  <div className="flex w-10 h-10 justify-center items-center flex-shrink-0">
                    <img src="/assets/Icons/Passes-icon.svg" alt="Passes" />
                  </div>
                  <span
                    className="whitespace-nowrap text-white text-sm opacity-0 
            group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Passes
                  </span>
                </div>
              )}

              {hasEvents && (
                <div
                  className="group flex items-center gap-1 rounded-full bg-[var(--color-primary)] 
          relative transition-all duration-300 overflow-hidden 
          w-[40px] hover:w-[110px] cursor-pointer"
                >
                  <div className="flex w-10 h-10 justify-center items-center flex-shrink-0">
                    <img src="/assets/Icons/Events-icon.svg" alt="Events" />
                  </div>
                  <span
                    className="whitespace-nowrap text-white text-sm opacity-0 
            group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Events
                  </span>
                </div>
              )}

              {hasDeals && (
                <div
                  className="group flex items-center gap-1 rounded-full bg-[var(--color-deals)] 
          relative transition-all duration-300 overflow-hidden 
          w-[40px] hover:w-[110px] cursor-pointer"
                >
                  <div className="flex w-10 h-10 justify-center items-center flex-shrink-0">
                    <img src="/assets/Icons/Dollar-icon.svg" alt="Deals" />
                  </div>
                  <span
                    className="whitespace-nowrap text-white text-sm opacity-0 
            group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Deals
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-2.5 flex-1 relative">
              <div className="flex w-10 h-10 justify-center items-center relative">
                <img src="/assets/Icons/Pin-Icon-Btn.svg" alt="Pin" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[27px] p-2.5 justify-center items-center gap-2.5 flex-shrink-0 self-stretch bg-gradient-to-b from-transparent to-black/21 relative">
          <div className="flex p-0.5 items-center gap-1 relative">
            <div className="w-2.5 h-2.5 rounded-full bg-color-secondary-default"></div>
            <div className="w-2.5 h-2.5 rounded-full opacity-50 bg-[var(--color-background)]"></div>
            <div className="w-2.5 h-2.5 rounded-full opacity-50 bg-[var(--color-background)]"></div>
            <div className="w-2.5 h-2.5 rounded-full opacity-50 bg-[var(--color-background)]"></div>
            <div className="w-2.5 h-2.5 rounded-full opacity-50 bg-[var(--color-background)]"></div>
          </div>
        </div>
      </div>

      <div className="flex px-3 py-2 flex-col items-start gap-2 self-stretch relative">
        <div className="relative group w-full">
          <div
            className="text-text-neutral-dark font-body text-[15px] font-bold leading-[120%] cursor-pointer w-full"
            title={title}
            onClick={handleSeeMore}
          >
            <div className="relative inline-block max-w-full">
              <span className="block truncate w-full">{title}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
            </div>
          </div>
        </div>
        <div
          className="self-stretch text-text-neutral font-body text-sm font-normal leading-[140%]"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical' as any,
            WebkitLineClamp: 2,
            overflow: 'hidden'
          }}
          title={address}
        >
          {address}
        </div>
      </div>

      <div className="w-full px-3 mt-auto">
        <div className="flex justify-between items-end w-full">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-x-[13px] gap-y-2">
              {visibleFacilities.map((facility, index) => (
                <div key={index} className="flex h-[18px] items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-lg bg-[var(--color-secondary)] flex-shrink-0"></div>
                  <div className="text-text-neutral font-body text-[13px] font-normal leading-[120%] truncate">
                    {facility}
                  </div>
                </div>
              ))}
              {hiddenFacilities.length > 0 && (
                <div className="flex h-[18px] items-center gap-1">
                  <div
                    className="text-[var(--color-secondary)] font-body text-[13px] font-normal leading-[120%] cursor-pointer"
                    title={hiddenTitle}
                  >
                    [more]
                  </div>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={handleSeeMore}
            className="text-[var(--color-primary)] font-body text-sm font-medium hover:underline whitespace-nowrap cursor-pointer ml-3 flex-shrink-0"
          >
            See More
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PlaceCard;
