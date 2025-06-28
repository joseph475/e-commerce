import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

const ResponsiveLayout = ({ 
  children,
  mobileComponent,
  desktopComponent,
  breakpoint = 'md' // sm, md, lg, xl
}) => {
  const breakpoints = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)'
  };

  const isDesktop = useMediaQuery(breakpoints[breakpoint]);

  // If specific components are provided for mobile/desktop
  if (mobileComponent && desktopComponent) {
    return isDesktop ? desktopComponent : mobileComponent;
  }

  // Otherwise, render children with responsive classes
  return (
    <div className={`responsive-layout ${isDesktop ? 'desktop-view' : 'mobile-view'}`}>
      {children}
    </div>
  );
};

const MobileView = ({ children, className = '' }) => {
  return (
    <div className={`block md:hidden ${className}`}>
      {children}
    </div>
  );
};

const DesktopView = ({ children, className = '' }) => {
  return (
    <div className={`hidden md:block ${className}`}>
      {children}
    </div>
  );
};

const TabletView = ({ children, className = '' }) => {
  return (
    <div className={`hidden sm:block md:hidden ${className}`}>
      {children}
    </div>
  );
};

// Hook for getting current screen size
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState('mobile');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setScreenSize('xl');
      } else if (width >= 1024) {
        setScreenSize('lg');
      } else if (width >= 768) {
        setScreenSize('md');
      } else if (width >= 640) {
        setScreenSize('sm');
      } else {
        setScreenSize('mobile');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

ResponsiveLayout.Mobile = MobileView;
ResponsiveLayout.Desktop = DesktopView;
ResponsiveLayout.Tablet = TabletView;
ResponsiveLayout.useMediaQuery = useMediaQuery;
ResponsiveLayout.useScreenSize = useScreenSize;

export default ResponsiveLayout;
