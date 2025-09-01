"use client";

import React, { useState } from 'react';
import { Button } from "@nextforge/ui";

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeFooterTab, setActiveFooterTab] = useState(1);

  const tabs = ["All", "Things To Do", "Where To Stay"];
  
  const footerItems = [
    { label: "Explore", icon: "/assets/Icons/Explore.svg" },
    { label: "Map", icon: "/assets/Icons/Map.svg" },
    { label: "Passes", icon: "/assets/Icons/Passes.svg" },
    { label: "Login", icon: "/assets/Icons/Login.svg" },
  ];

  return (
    <div className="lg:hidden flex flex-col h-screen bg-[var(--color-background)]">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-background)] border-b border-gray-200">
        <Button 
          variant="ghost" 
          size="icon"
          className="w-8 h-8 p-0"
        >
          <div className="flex flex-col gap-1">
            <div className="w-5 h-0.5 bg-gray-700"></div>
            <div className="w-5 h-0.5 bg-gray-700"></div>
            <div className="w-5 h-0.5 bg-gray-700"></div>
          </div>
        </Button>

        <div className="flex items-center">
          <img 
            src="/assets/ocala_logo.svg"
            className="h-8 w-auto" 
            alt="Ocala Logo" 
          />
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="w-8 h-8 p-0"
        >
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
          </div>
        </Button>
      </div>

      <div className="flex bg-[#4A90A4] px-4 py-2">
        {tabs.map((tab, index) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(index)}
            variant="ghost"
            className={`flex-1 h-10 rounded-full mx-1 text-sm font-medium transition-colors ${
              activeTab === index
                ? "bg-[var(--color-background)] text-[#4A90A4]"
                : "text-[var(--color-background)] hover:bg-[var(--color-background)]/20"
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-background)] border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {footerItems.map((item, index) => {
            const isActive = index === activeFooterTab;

            return (
              <Button
                key={item.label}
                onClick={() => setActiveFooterTab(index)}
                variant="ghost"
                className={`flex flex-col items-center py-2 px-3 h-auto transition-colors duration-200 ${
                  isActive
                    ? "text-[#4A90A4]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-6 h-6 mb-1 transition duration-200 ${
                    isActive ? "brightness-0 saturate-100" : ""
                  }`}
                  style={isActive ? { filter: 'invert(36%) sepia(25%) saturate(1068%) hue-rotate(162deg) brightness(91%) contrast(86%)' } : {}}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
