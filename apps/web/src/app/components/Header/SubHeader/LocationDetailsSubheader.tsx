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
    <div ref={subheaderRef} className="bg-[#E3EEF3] transition-all duration-300">
      <div className="w-full mt-6 bg-[var(--color-primary)] relative">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center relative">
            <div className="absolute -top-12 left-0">
              <div className="w-20 h-20 rounded-full flex items-center justify-center">
                <img
                  src={"/assets/Icons/Subheader-logo.svg"}
                  alt="Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>
            <span className="text-white font-medium text-xl pl-20">
              {title || "Starlight Oasis Glamping"}
            </span>
          </div>

          <div className="flex items-center space-x-6">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className= "text-lg text-white cursor-pointer"
              >
                {tab.label}
              </Button>
            ))}

            <button className="bg-yellow-400 text-black text-lg font-medium px-3 py-1.5 rounded-full flex items-center space-x-1 hover:bg-yellow-500 transition cursor-pointer">
              <span>Book it</span>
              <img src="/assets/Icons/Book-btn.svg" alt="Arrow Right" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
