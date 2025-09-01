"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PlaceCard from './PlaceCard';
import "./Sidebar.css";
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import type { RootState } from '../../../../store';
import type { Place } from '../../../../store/slices/placesSlice';
import { setSelectedPlace, clearSelectedPlace, setHoveredPlace, clearHoveredPlace } from '../../../../store/slices/placesSlice';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { places, loading, error, selectedPlace, isSidebarOpen, categories } = useAppSelector((state: RootState) => state.places);
  const listRef = useRef<HTMLDivElement | null>(null);

  const nameById = useMemo(() => {
    const map = new Map<number, string>();
    const walk = (node: any) => {
      if (node && typeof node.CategoryId === 'number') map.set(node.CategoryId, node.CategoryName);
      if (Array.isArray(node?.Categories)) node.Categories.forEach(walk);
    };
    categories?.forEach(walk);
    return map;
  }, [categories]);

  const getCategoryNames = (p: Place): string[] => {
    const ids = String(p.Category || '')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    const names = ids.map((id) => nameById.get(id)).filter(Boolean) as string[];
    return names;
  };

  const scrollSelectedIntoView = React.useCallback(() => {
    if (!selectedPlace || !listRef.current) return;
    const container = listRef.current;
    const cardId = `place-${selectedPlace.Id}`;

    let attempts = 0;
    const tryScroll = () => {
      if (!container) return;
      const el = container.querySelector<HTMLDivElement>(`#${CSS.escape(cardId)}`);
      if (el) {
        const top = el.offsetTop;
        container.scrollTo({ top, behavior: 'smooth' });
        return;
      }
      if (attempts++ < 8) {
        requestAnimationFrame(tryScroll);
      }
    };
    requestAnimationFrame(tryScroll);
  }, [selectedPlace]);

  useEffect(() => { scrollSelectedIntoView(); }, [scrollSelectedIntoView]);

  useEffect(() => {
    if (!isSidebarOpen || !selectedPlace) return;
    const t = setTimeout(scrollSelectedIntoView, 50);
    return () => clearTimeout(t);
  }, [isSidebarOpen, places, selectedPlace, scrollSelectedIntoView]);

  const getAddress = (p: Place) => {
    const parts = [p?.Address, p?.City, p?.State, p?.ZipCode].filter(Boolean);
    return parts.join(', ');
  };

  if (!isSidebarOpen) return null;

  return (
    <div className="flex items-start gap-2.5 self-stretch relative">
      <div
        ref={listRef}
        className="w-full lg:w-[580px] max-w-full relative overflow-y-auto scrollbar-thin
                   grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6
                   h-[calc(100dvh-176px)] md:h-[calc(100vh-330px)]"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-text-neutral">Loading places…</span>
          </div>
        )}
        {error && !loading && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && places && places.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-text-neutral">No places found.</span>
          </div>
        )}
        {!loading && !error && places && places.length > 0 && (
          <>
            {places.map((p: Place, index: number) => (
              <div
                key={p.Id ?? index}
                id={`place-${p.Id}`}
                onMouseEnter={() => dispatch(setHoveredPlace(p))}
                onMouseLeave={() => dispatch(clearHoveredPlace())}
                // onClick={() => {
                //   router.push(`/pages/DetailsPage?id=${p.Id}`);
                // }}
                className={`w-full cursor-pointer rounded-lg ${selectedPlace?.Id === p.Id ? "border-2 border-orange-500" : ""}`}
              >
                <PlaceCard
                  title={p.Title}
                  address={getAddress(p)}
                  imageUrl={p.Thumb || p.Image || '#006094'}
                  facilities={getCategoryNames(p)}
                  hasTicket={true}
                  hasEvents={true}
                  hasDeals={true}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
