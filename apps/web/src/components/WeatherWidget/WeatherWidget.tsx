'use client';

import React, { useEffect } from 'react';

interface WeatherWidgetProps {
  location?: string;
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  location = 'Marion FL',
  className = '',
}) => {
  useEffect(() => {
    if (!document.getElementById('weatherwidget-io-js')) {
      const script = document.createElement('script');
      script.innerHTML = `!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');`;
      document.head.appendChild(script);
    }

    const widget = document.querySelector<HTMLAnchorElement>('.weatherwidget-io');
    if (widget) {
      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary')
        .trim();
      widget.setAttribute('data-basecolor', primaryColor);
    }

    if ((window as any).__weatherwidget_init) {
      (window as any).__weatherwidget_init();
    }

    return () => {
      const scriptElement = document.getElementById('weatherwidget-io-js');
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  return (
    <div className={`${className}`}>
      <a 
        className="weatherwidget-io" 
        href="https://forecast7.com/en/29d28n82d13/marion-county/?unit=us" 
        data-label_1="MARION FL" 
        data-label_2="WEATHER" 
        data-theme="original"
      >
        {location.toUpperCase()} WEATHER
      </a>
    </div>
  );
};

export default WeatherWidget;
