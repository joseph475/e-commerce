import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { isAppInstalled, showInstallPrompt } from '../../utils/pwa';

const PWAStatus = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is installed
    setIsInstalled(isAppInstalled());

    // Listen for install prompt availability
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setCanInstall(true);
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setIsInstalled(true);
      setCanInstall(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Online/Offline Status */}
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} 
           title={isOnline ? 'Online' : 'Offline'} />
      
      {/* PWA Install Status */}
      {isInstalled ? (
        <div className="flex items-center space-x-1 text-green-600" title="App Installed">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs hidden sm:inline">Installed</span>
        </div>
      ) : canInstall ? (
        <button
          onClick={handleInstall}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
          title="Install App"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">Install</span>
        </button>
      ) : null}
    </div>
  );
};

export default PWAStatus;
