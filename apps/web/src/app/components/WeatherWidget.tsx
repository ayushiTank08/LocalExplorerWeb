'use client';

import React, { useEffect, useRef } from 'react';

interface WeatherWidgetProps {
  location?: string;
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  location = 'Ocala',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInitialized = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !widgetInitialized.current) {
      const script = document.createElement('script');
      script.src = 'https://weatherwidget.io/js/widget.min.js';
      script.async = true;
      
      const container = containerRef.current;
      if (container) {
        container.innerHTML = `
          <a class="weatherwidget-io" 
             href="https://forecast7.com/en/29d28n82d13/marion-county/?unit=us" 
             data-label_1="${location.toUpperCase()}" 
             data-label_2="WEATHER" 
             data-theme="pure" 
             data-textcolor="#ffffff" 
             data-highcolor="#ffffff" 
             data-suncolor="#ffffffff" 
             data-mooncolor="#ffffff" 
             data-cloudcolor="#ffffff" 
             data-cloudfill="#000000" 
             data-raincolor="#ffffff" 
             data-snowcolor="#ffffff">
            ${location} WEATHER
          </a>
        `;
        
        container.appendChild(script);
        widgetInitialized.current = true;
      }

      return () => {
        if (container && container.contains(script)) {
          container.removeChild(script);
        }
      };
    }
  }, [location]);

  return (
    <div 
      ref={containerRef} 
      className={`weather-widget ${className}`}
      style={{ minHeight: '180px' }}
    />
  );
};

export default WeatherWidget;
