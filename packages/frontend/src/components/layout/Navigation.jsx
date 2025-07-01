import { h } from 'preact';
import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import ResponsiveLayout from './ResponsiveLayout';
import { useSidebar } from './AppLayout';
import { useAuth } from '../../contexts/AuthContext';

const NavigationItem = ({ icon, label, href, active = false, onClick, mobile = false, collapsed = false }) => {
  const baseClasses = mobile 
    ? 'flex flex-col items-center justify-center py-2 px-1 text-xs'
    : collapsed
    ? 'flex items-center justify-center p-3 rounded-lg'
    : 'flex items-center px-4 py-3 text-sm font-medium rounded-lg';
    
  const activeClasses = mobile
    ? 'text-blue-600'
    : 'bg-blue-100 text-blue-700';
    
  const inactiveClasses = mobile
    ? 'text-gray-600'
    : 'text-gray-700 hover:bg-gray-100';

  const classes = `${baseClasses} ${active ? activeClasses : inactiveClasses} transition-colors duration-200`;

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (href) {
      route(href); // Use client-side routing instead of page reload
    }
  };

  return (
    <a href={href} className={classes} onClick={handleClick}>
      <div className={mobile ? 'w-6 h-6 mb-1' : collapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}>
        {icon}
      </div>
      {!collapsed && <span className={mobile ? 'text-xs' : ''}>{label}</span>}
    </a>
  );
};

// Helper function to filter navigation items based on user role
const getFilteredNavItems = (allItems, userRole) => {
  if (userRole === 'admin') {
    return allItems; // Admin can see all items
  }
  
  if (userRole === 'cashier') {
    // Cashier cannot access reports, user management, settings, and inventory
    const restrictedPaths = ['/reports', '/users', '/settings', '/inventory'];
    return allItems.filter(item => !restrictedPaths.includes(item.href));
  }
  
  return allItems; // Default: show all items
};

const MobileBottomNav = ({ currentPath }) => {
  const { user } = useAuth();
  
  const allNavItems = [
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
        </svg>
      ),
      label: 'Dashboard',
      href: '/',
      active: currentPath === '/'
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      ),
      label: 'POS',
      href: '/pos',
      active: currentPath === '/pos'
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Sales',
      href: '/sales',
      active: currentPath === '/sales'
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      label: 'Inventory',
      href: '/inventory',
      active: currentPath === '/inventory'
    }
  ];

  const navItems = getFilteredNavItems(allNavItems, user?.role);

  const gridCols = navItems.length <= 3 ? `grid-cols-${navItems.length}` : 'grid-cols-4';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className={`grid ${gridCols} h-16`}>
        {navItems.map((item, index) => (
          <NavigationItem
            key={index}
            {...item}
            mobile={true}
          />
        ))}
      </div>
    </div>
  );
};

const DesktopSidebar = ({ currentPath, isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  
  const allNavItems = [
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
        </svg>
      ),
      label: 'Dashboard',
      href: '/',
      active: currentPath === '/'
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      ),
      label: 'Point of Sale',
      href: '/pos',
      active: currentPath === '/pos'
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Sales & Orders',
      href: '/sales',
      active: currentPath === '/sales'
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Reports & Analytics',
      href: '/reports',
      active: currentPath === '/reports'
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      label: 'Inventory Management',
      href: '/inventory',
      active: currentPath === '/inventory'
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      label: 'User Management',
      href: '/users',
      active: currentPath === '/users'
    },
    // Settings temporarily hidden
    // {
    //   icon: (
    //     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    //   label: 'Settings',
    //   href: '/settings',
    //   active: currentPath === '/settings'
    // }
  ];

  const navItems = getFilteredNavItems(allNavItems, user?.role);

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900">POS System</h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
              isCollapsed 
                ? "M13 5l7 7-7 7M5 5l7 7-7 7"
                : "M11 19l-7-7 7-7m8 14l-7-7 7-7"
            } />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className={isCollapsed ? "p-1 space-y-1" : "p-4 space-y-2"}>
        {navItems.map((item, index) => (
          <div key={index} className="relative group">
            <NavigationItem
              {...item}
              mobile={false}
              collapsed={isCollapsed}
            />
            {isCollapsed && (
              <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">User Name</p>
              <p className="text-xs text-gray-500 truncate">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Navigation = ({ currentPath = '/' }) => {
  // Try to use sidebar context, fallback to local state if not available
  let isCollapsed, toggleSidebar;
  try {
    const sidebarContext = useSidebar();
    isCollapsed = sidebarContext.isCollapsed;
    toggleSidebar = sidebarContext.toggleSidebar;
  } catch {
    // Fallback for when Navigation is used outside of AppLayout
    const [localCollapsed, setLocalCollapsed] = useState(false);
    isCollapsed = localCollapsed;
    toggleSidebar = () => setLocalCollapsed(!localCollapsed);
  }

  return (
    <ResponsiveLayout
      mobileComponent={<MobileBottomNav currentPath={currentPath} />}
      desktopComponent={
        <DesktopSidebar 
          currentPath={currentPath} 
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      }
    />
  );
};

export default Navigation;
