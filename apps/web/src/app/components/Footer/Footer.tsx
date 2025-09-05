"use client";

import React, { useState } from 'react';
import { Button } from '@nextforge/ui';

const Footer: React.FC = () => {

  const [activeIndex, setActiveIndex] = useState(0);

  const socialIcons = [
    { name: 'Facebook', icon: <img src="/assets/Social_Logos/facebook.svg" alt="All-Categories" className="w-6 h-6" /> },
    { name: 'X (Twitter)', icon: <img src="/assets/Social_Logos/twitter.svg" alt="Twitter" className="w-6 h-6" /> },
    { name: 'Instagram', icon: <img src="/assets/Social_Logos/instagram.svg" alt="Instagram" className="w-6 h-6" /> },
    { name: 'YouTube', icon: <img src="/assets/Social_Logos/youtube.svg" alt="Youtube" className="w-6 h-6" /> },
    { name: 'Pinterest', icon: <img src="/assets/Social_Logos/pinterest.svg" alt="Pinterest" className="w-6 h-6" /> },
    { name: 'TripAdvisor', icon: <img src="/assets/Social_Logos/tripadvisor.svg" alt="Tripadvisor" className="w-6 h-6" /> }
  ];

  const navItems = [
    { label: 'About', href: '#' },
    { label: 'FAQs', href: '#' },
    { label: 'Feedback & Support', href: '#' }
  ];

  const footerItems = [
    { label: "Explore", icon: "/assets/Icons/Explore.svg" },
    { label: "Map", icon: "/assets/Icons/Map.svg" },
    { label: "Passes", icon: "/assets/Icons/Passes.svg" },
    { label: "Login", icon: "/assets/Icons/Login.svg" },
  ];

  return (
    <>
      <footer className="hidden lg:block bg-[var(--color-primary-lighter)] py-2 px-6">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* {socialIcons.map((social, index) => (
              <div
                key={index}
                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="text-gray-600 text-lg font-medium">
                  {social.icon}
                </span>
              </div>
            ))} */}
          </div>

          <div className="flex items-start justify-between gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 justify-end">
                {navItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <a
                      href={item.href}
                      className="text-[var(--color-primary)] transition-colors font-medium"
                    >
                      {item.label}
                    </a>
                    {index < navItems.length - 1 && (
                      <span className="text-gray-600">|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="text-gray-600 text-sm">
                © 2024 Ocala Marion County, FL | <span className="underline">Privacy Policy</span> | <span className="underline">Terms & Conditions</span>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <img src="/assets/Powered-by-Local-Explorer.png" alt="Local Explorers Logo" className="h-16" />
            </div>
          </div>

        </div>
      </footer>

      {/* Mobile bottom footer removed; bottom navigation is handled in page.tsx */}
    </>
  );
};

export default Footer;
