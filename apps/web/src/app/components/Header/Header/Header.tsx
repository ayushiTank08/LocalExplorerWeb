"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@nextforge/ui";
import { LoginModal } from "../../Login/LoginModal";

interface HeaderProps {
  onSearchToggle?: () => void;
}

import CryptoJS from 'crypto-js';

interface UserData {
  FirstName: string;
  LastName: string;
  ProfileURL?: string;
  Email: string;
}

const decryptData = (encryptedData: string): string => {
  try {
    if (!encryptedData) return '';
    
    if (!encryptedData.includes('==') && !encryptedData.includes('+') && !encryptedData.includes('/')) {
      return encryptedData;
    }
    
    const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';
    const ENCRYPTION_IV = process.env.NEXT_PUBLIC_ENCRYPTION_IV || '';
    
    if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
      console.warn('Encryption key or IV not found. Cannot decrypt data.');
      return encryptedData;
    }
    
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const iv = CryptoJS.enc.Utf8.parse(ENCRYPTION_IV);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8) || encryptedData;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData;
  }
};

const Header: React.FC<HeaderProps> = ({ onSearchToggle }) => {
  const [activeTab, setActiveTab] = useState('explore');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        const decryptedUserData = {
          ...userData,
          FirstName: decryptData(userData.FirstName || ''),
          LastName: decryptData(userData.LastName || ''),
          Email: decryptData(userData.Email || '')
        };
        setUserData(decryptedUserData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLoginSuccess = (userData: UserData) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('login'));
    }
    
    const decryptedUserData = {
      ...userData,
      FirstName: decryptData(userData.FirstName || ''),
      LastName: decryptData(userData.LastName || ''),
      Email: decryptData(userData.Email || '')
    };
    setUserData(decryptedUserData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    setUserData(null);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('login'));
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchClick = () => {
    if (onSearchToggle) {
      onSearchToggle();
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] overflow-hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
          <div className="fixed left-0 top-0 h-full w-full bg-[var(--color-background)] shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Button
                onClick={toggleMobileMenu}
                variant="ghost"
                size="icon"
                className="w-8 h-8 p-0"
                aria-label="Close Menu"
              >
                <div className="w-5 h-5 relative">
                  <span className="absolute inset-x-0 top-2 h-0.5 bg-gray-700 rotate-45 rounded" />
                  <span className="absolute inset-x-0 top-2 h-0.5 bg-gray-700 -rotate-45 rounded" />
                </div>
              </Button>

              <div className="flex-1 flex justify-center">
                <img src="/assets/ocala_logo.svg" className="h-8 w-auto" alt="Ocala Logo" />
              </div>

              <button className="w-8 h-8 flex items-center justify-center" aria-label="Search">
                <img src="/assets/Icons/Search.svg" alt="Search" className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Menu</h2>

              <div className="space-y-1">
                {/* <Link href="/" passHref>
                  <Button className="flex h-10 min-w-10 p-2 justify-center items-center gap-2 rounded border border-[var(--color-neutral)] relative cursor-pointer">
                    <span className="flex w-5 h-5 justify-center items-center relative">
                      <img src="/assets/Icons/Home.svg" alt="Home" width="20" height="20" className="w-5 h-5" />
                    </span>
                  </Button>
                </Link> */}
                <Link href="/" passHref className="w-full">
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg">
                    <img src="/assets/Icons/Home.svg" alt="Home" width="20" height="20" className="w-5 h-5" />
                    <span className="text-gray-800">Home</span>
                  </button>
                </Link>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg">
                  <img src="/assets/Icons/Ticket.svg" alt="Passes" className="w-5 h-5" />
                  <span className="text-gray-800">Passes</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg">
                  <div className="w-5 h-5 rounded border border-gray-300" />
                  <span className="text-gray-800">My Cart</span>
                </button>
              </div>

              <div className="border-t border-gray-200 my-4" />

              <div className="space-y-1">
                <button className="w-full text-left p-3 hover:bg-gray-100 rounded-lg text-gray-800">About us</button>
                <button className="w-full text-left p-3 hover:bg-gray-100 rounded-lg text-gray-800">FAQs</button>
                <button className="w-full text-left p-3 hover:bg-gray-100 rounded-lg text-gray-800">Feedback & Support</button>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-gray-200 flex items-center px-4 bg-white z-[10000]">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden" />
                  <span className="text-gray-800 font-medium">Judith Rodriguez</span>
                </div>
                <img src="/assets/Icons/Login.svg" alt="External" className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-24 justify-center items-center gap-2 self-stretch bg-[var(--color-background)] relative max-w-[1440px] mx-auto w-full px-6 lg:px-0">
        <div className="lg:hidden flex items-center justify-between w-full">
          <Button
            onClick={toggleMobileMenu}
            className="w-6 h-6 flex items-center justify-center cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-4 h-1 bg-gray-600 rounded-full rotate-45"></div>
                <div className="w-4 h-1 bg-gray-600 rounded-full -rotate-45 absolute"></div>
              </div>
            ) : (
              <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
                <img
                  src="/assets/Icons/Hamburger.svg"
                  alt="Hamburger"
                  width="28" height="24"
                />
              </div>
            )}
          </Button>

          <div className="flex-1 flex justify-center">
            <img
              src="/assets/ocala_logo.svg"
              className="h-8 w-auto"
              alt="Ocala Logo"
            />
          </div>

          <Button
            onClick={handleSearchClick}
            className="w-6 h-6 flex items-center justify-center cursor-pointer"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <img src="/assets/Icons/Search.svg" alt="Home" width="22" height="22" />
            </div>
          </Button>
        </div>

        <div className="hidden lg:flex items-center gap-4 flex-1 relative">
          <Link href="/" passHref>
            <Button className="flex h-10 min-w-10 p-2 justify-center items-center gap-2 rounded border border-[var(--color-neutral)] relative cursor-pointer">
              <span className="flex w-5 h-5 justify-center items-center relative">
                <img src="/assets/Icons/Home.svg" alt="Home" width="20" height="20" className="w-5 h-5" />
              </span>
            </Button>
          </Link>

          <Button className="flex h-10 px-4 py-2 justify-center items-center gap-2 rounded border border-[var(--color-neutral)] relative cursor-pointer">
            <span className="flex w-5 h-5 justify-center items-center relative">
              <img src="/assets/Icons/Ticket.svg" alt="Ticket" width="20" height="20" className="w-5 h-5" />
            </span>
            <span className="text-text-neutral font-body text-base font-normal">
              Passes
            </span>
          </Button>

          <Button className="flex h-10 p-2 justify-center items-center gap-0.5 rounded relative cursor-pointer">
            <div className="text-text-neutral font-body text-base font-normal">
              EN
            </div>
            <img src="/assets/Icons/Down-Arrow.svg" alt="Down_Arrow" width="20" height="20" className="w-5 h-5" />
          </Button>
        </div>

        <div className="hidden lg:flex justify-center items-center gap-2 flex-1 relative">
          <Link href="/" passHref>
            <img
              src="/assets/ocala_logo.svg"
              className="w-[199.605px] h-14 relative cursor-pointer"
              alt="Logo"
            />
          </Link>
        </div>

        <div className="hidden lg:flex justify-end items-center gap-2 flex-1 relative">
          <div className="flex px-6 items-center gap-6 relative">
            <Button className="text-text-primary font-body text-[17px] font-normal leading-[140%] text-[var(--color-primary)] cursor-pointer">
              About
            </Button>
            <Button className="text-text-primary font-body text-[17px] font-normal leading-[140%] text-[var(--color-primary)] cursor-pointer">
              FAQs
            </Button>
          </div>
          {userData ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {userData.ProfileURL ? (
                  <img 
                    src={userData.ProfileURL} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm">
                    {userData.FirstName?.charAt(0)}{userData.LastName?.charAt(0)}
                  </div>
                )}
                {/* <img 
                  src="/assets/Icons/Down-Arrow.svg" 
                  alt="" 
                  className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                /> */}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Orders
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-10 px-4 py-2 justify-center items-center gap-2 rounded border border-text-primary relative border-[var(--color-primary)]">
              <Button 
                onClick={() => setIsLoginModalOpen(true)}
                className="text-text-primary font-body text-base font-normal text-[var(--color-primary)] cursor-pointer"
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-[var(--color-background)] border-t border-gray-200">
        <div className="h-full grid grid-cols-4">
          <button className="flex flex-col items-center justify-center gap-1 text-[var(--color-primary)]">
            <img src="/assets/Icons/Explore.svg" alt="Explore" className="w-6 h-6" />
            <span className="text-xs">Explore</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-gray-700">
            <img src="/assets/Icons/Map.svg" alt="Map" className="w-6 h-6" />
            <span className="text-xs">Map</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-gray-700">
            <img src="/assets/Icons/Passes.svg" alt="Passes" className="w-6 h-6" />
            <span className="text-xs">Passes</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-gray-700">
            <img src="/assets/Icons/Login.svg" alt="Login" className="w-6 h-6" />
            <span className="text-xs">Login</span>
          </button>
        </div>
      </nav>

      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default Header;
