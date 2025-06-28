import { h } from 'preact';
import { route } from 'preact-router';

const Header = ({ apiStatus }) => {
  const handleNavigation = (path) => {
    route(path);
  };

  return (
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          {/* Logo */}
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">
              Boilerplate App
            </h1>
          </div>

          {/* Navigation */}
          <nav class="hidden md:flex space-x-8">
            <button
              onClick={() => handleNavigation('/')}
              class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/test')}
              class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Test
            </button>
          </nav>

          {/* API Status Indicator */}
          <div class="flex items-center space-x-2">
            <div class={`w-2 h-2 rounded-full ${
              apiStatus?.connected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span class="text-sm text-gray-600">
              {apiStatus?.connected ? 'API Connected' : 'API Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
