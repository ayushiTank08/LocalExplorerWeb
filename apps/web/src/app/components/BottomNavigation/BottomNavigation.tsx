"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BottomNavigation = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-[var(--color-primary)]' : 'text-gray-700';
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-[var(--color-background)] border-t border-gray-200 z-50">
      <div className="h-full grid grid-cols-4">
        <Link href="/explore" className={`flex flex-col items-center justify-center gap-1 ${isActive('/explore')}`}>
          <img src="/assets/Icons/Explore.svg" alt="Explore" className="w-6 h-6" />
          <span className="text-xs">Explore</span>
        </Link>
        <Link href="/map" className={`flex flex-col items-center justify-center gap-1 ${isActive('/map')}`}>
          <img src="/assets/Icons/Map.svg" alt="Map" className="w-6 h-6" />
          <span className="text-xs">Map</span>
        </Link>
        <Link href="/passes" className={`flex flex-col items-center justify-center gap-1 ${isActive('/passes')}`}>
          <img src="/assets/Icons/Passes.svg" alt="Passes" className="w-6 h-6" />
          <span className="text-xs">Passes</span>
        </Link>
        <Link href="/login" className={`flex flex-col items-center justify-center gap-1 ${isActive('/login')}`}>
          <img src="/assets/Icons/Login.svg" alt="Login" className="w-6 h-6" />
          <span className="text-xs">Login</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
