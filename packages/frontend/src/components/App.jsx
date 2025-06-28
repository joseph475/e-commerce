import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Router from 'preact-router';
import apiService from '../services/api';

// Components
import Header from './layout/Header';
import Footer from './layout/Footer';
import HomePage from '../pages/HomePage';
import TestPage from '../pages/TestPage';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await apiService.testHealth();
      setApiStatus({
        connected: true,
        message: response.message,
        timestamp: response.timestamp
      });
    } catch (error) {
      setApiStatus({
        connected: false,
        message: 'Failed to connect to backend API',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen flex flex-col">
      <Header apiStatus={apiStatus} />
      
      <main class="flex-1">
        <Router>
          <HomePage path="/" apiStatus={apiStatus} />
          <TestPage path="/test" />
        </Router>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
