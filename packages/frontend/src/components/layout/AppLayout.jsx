import { h, createContext } from 'preact';
import { useState, useContext } from 'preact/hooks';
import ResponsiveLayout from './ResponsiveLayout';
import Navigation from './Navigation';
import Header from './Header';

// Create context for sidebar state
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const SidebarProvider = ({ children }) => {
  // Check if we're in tablet view (768px to 1024px)
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
  const [isCollapsed, setIsCollapsed] = useState(isTablet);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

const AppLayout = ({ children, currentPath }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Navigation currentPath={currentPath} />
        
        <ResponsiveLayout
          mobileComponent={
            <div className="pb-16"> {/* Add padding for mobile bottom nav */}
              <Header />
              {children}
            </div>
          }
          desktopComponent={
            <DesktopLayoutWithSidebar>
              <Header />
              {children}
            </DesktopLayoutWithSidebar>
          }
        />
      </div>
    </SidebarProvider>
  );
};

const DesktopLayoutWithSidebar = ({ children }) => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div 
      className={`transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}
    >
      {children}
    </div>
  );
};

export default AppLayout;
