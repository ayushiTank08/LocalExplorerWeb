"use client";

import React, { useState } from "react";
import SubHeader from "./components/Header/SubHeader/SubHeader";
import Header from "./components/Header/Header/Header";
import Sidebar from "./pages/Home/Sidebar/Sidebar";
import Map from "./pages/Home/Map/Map";
import PlaceCard from "./pages/Home/Sidebar/PlaceCard";
import Footer from "./components/Footer/Footer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { RootState } from "../store";
import type { Place } from "../store/slices/placesSlice";
import { setSelectedPlace, setSidebarOpen } from "../store/slices/placesSlice";
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Home() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'explore' | 'map' | 'passes' | 'login'>('explore');
  const dispatch = useAppDispatch();
  const { places, loading, error } = useAppSelector((state: RootState) => state.places);

  const toggleSearch = () => setIsSearchActive(!isSearchActive);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  React.useEffect(() => {
    dispatch(setSidebarOpen(mobileTab === 'explore'));
  }, [mobileTab, dispatch]);

  return (
    <div className="flex flex-col min-h-auto">
      {/* <Header onSearchToggle={toggleSearch} /> */}
      {/* <SubHeader isSearchActive={isSearchActive} /> */}

      <div className="hidden lg:flex flex-1 flex-row items-start gap-6 bg-[var(--color-primary-lighter)] relative w-full max-w-[1440px] mx-auto">
        <div className="h-full transition-transform duration-300">
          <Sidebar />
        </div>
        <div className="flex-1 h-full">
          <div className="w-full h-full flex items-center justify-center">
            <Map />
          </div>
        </div>
      </div>

      <div className="lg:hidden flex-1 px-4 items-start gap-4 bg-[var(--color-primary-lighter)] relative pb-20">
        {mobileTab === 'map' && (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Map />
          </div>
        )}

        {mobileTab === 'explore' && (
          <div className="w-full h-full pt-2">
            <Sidebar />
          </div>
        )}
        {(mobileTab === 'passes' || mobileTab === 'login') && (
          <div className="flex items-center justify-center h-[60vh] text-gray-600">Coming soon!</div>
        )}
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-[20] pointer-events-auto bg-white border-t border-gray-200">
        <nav className="grid grid-cols-4 h-16 px-4">
          <button type="button" onClick={() => setMobileTab('explore')} className={`flex flex-col items-center justify-center text-xs ${mobileTab === 'explore' ? 'text-[var(--color-primary)] font-medium' : 'text-gray-600'}`}>
            <img
              src="/assets/Icons/Explore.svg"
              alt="Explore"
              className="w-6 h-6 mb-1 transition duration-200"
              style={mobileTab === 'explore' ? { filter: 'invert(36%) sepia(25%) saturate(1068%) hue-rotate(162deg) brightness(91%) contrast(86%)' } : {}}
            />
            <span>Explore</span>
          </button>
          <button type="button" onClick={() => setMobileTab('map')} className={`flex flex-col items-center justify-center text-xs ${mobileTab === 'map' ? 'text-[var(--color-primary)] font-medium' : 'text-gray-600'}`}>
            <img
              src="/assets/Icons/Map.svg"
              alt="Map"
              className="w-6 h-6 mb-1 transition duration-200"
              style={mobileTab === 'map' ? { filter: 'invert(36%) sepia(25%) saturate(1068%) hue-rotate(162deg) brightness(91%) contrast(86%)' } : {}}
            />
            <span>Map</span>
          </button>
          <button type="button" onClick={() => setMobileTab('passes')} className={`flex flex-col items-center justify-center text-xs ${mobileTab === 'passes' ? 'text-[var(--color-primary)] font-medium' : 'text-gray-600'}`}>
            <img
              src="/assets/Icons/Passes.svg"
              alt="Passes"
              className="w-6 h-6 mb-1 transition duration-200"
              style={mobileTab === 'passes' ? { filter: 'invert(36%) sepia(25%) saturate(1068%) hue-rotate(162deg) brightness(91%) contrast(86%)' } : {}}
            />
            <span>Passes</span>
          </button>
          <button type="button" onClick={() => setMobileTab('login')} className={`flex flex-col items-center justify-center text-xs ${mobileTab === 'login' ? 'text-[var(--color-primary)] font-medium' : 'text-gray-600'}`}>
            <img
              src="/assets/Icons/Login.svg"
              alt="Login"
              className="w-6 h-6 mb-1 transition duration-200"
              style={mobileTab === 'login' ? { filter: 'invert(36%) sepia(25%) saturate(1068%) hue-rotate(162deg) brightness(91%) contrast(86%)' } : {}}
            />
            <span>Login</span>
          </button>
        </nav>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
