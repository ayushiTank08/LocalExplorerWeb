'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@nextforge/ui';

interface LocationDetailsSubheaderProps {
  title: string;
  category: string;
  imageUrl?: string;
}

const tabs = [
  { id: 'events', label: 'Events' },
  { id: 'passes', label: 'Passes' },
  { id: 'deals', label: 'Deals' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'posts', label: 'Posts' },
];

export function LocationDetailsSubheader({
  title,
  category,
  imageUrl
}: LocationDetailsSubheaderProps) {
  const subheaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (subheaderRef.current) {
        if (window.scrollY > 100) {
          subheaderRef.current.style.position = 'fixed';
          subheaderRef.current.style.top = '0';
          subheaderRef.current.style.left = '0';
          subheaderRef.current.style.right = '0';
          subheaderRef.current.style.zIndex = '50';
        } else {
          subheaderRef.current.style.position = 'static';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      if (history.pushState) {
        history.pushState(null, '', `#${sectionId}`);
      } else {
        window.location.hash = `#${sectionId}`;
      }
    }
  };

  return (
    <div
      ref={subheaderRef}
      className="bg-[var(--color-primary-lighter)] transition-all duration-300"
    >
      <div className="px-6 lg:px-0">
        <div
          className="
        w-full mt-8 bg-[var(--color-primary)] relative rounded-md 
        max-w-[1440px] mx-auto
        lg:sticky lg:top-0 lg:z-50
      "
        >
          <div className="lg:hidden px-4 py-6 flex flex-col items-center relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="w-20 h-20 rounded-full flex items-center justify-center">
                <img
                  src="/assets/Icons/Subheader-logo.svg"
                  alt="Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>
            <span className="text-white font-medium text-xl text-center mt-8">
              {title || "Starlight Oasis Glamping"}
            </span>

            <button className="mt-4 bg-yellow-400 text-black text-lg font-medium px-5 py-2 rounded-full flex items-center space-x-2 hover:bg-yellow-500 transition cursor-pointer">
              <span>Book it</span>
              <img
                src="/assets/Icons/Book-btn.svg"
                alt="Arrow Right"
                className="w-5 h-5"
              />
            </button>

            <div className="mt-4 flex justify-around gap-4 w-full">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className="text-white text-sm"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-between gap-6 px-6 py-4 relative">
            <div className="absolute flex items-center gap-3">
              <div className="w-20 h-20 rounded-full flex justify-center absolute -top-12">
                <img
                  src="/assets/Icons/Subheader-logo.svg"
                  alt="Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <span className="text-white font-medium text-lg ml-24">
                {title || "Starlight Oasis Glamping"}
              </span>
            </div>

            <div className="flex items-center gap-6 ml-auto">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className="text-white text-base cursor-pointer"
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <button className="bg-yellow-400 text-black text-sm font-medium px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-yellow-500 transition cursor-pointer">
              <span>Book it</span>
              <img
                src="/assets/Icons/Book-btn.svg"
                alt="Arrow Right"
                className="w-4 h-4"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
