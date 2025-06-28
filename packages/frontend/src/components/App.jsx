import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Router from 'preact-router';

// Contexts
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';

// Components
import ProtectedRoute from './auth/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import POSPage from '../pages/POSPage';
import InventoryPage from '../pages/InventoryPage';

const AppRouter = () => {
  return (
    <Router>
      <ProtectedRoute path="/">
        <Dashboard path="/" />
      </ProtectedRoute>
      <ProtectedRoute path="/pos">
        <POSPage path="/pos" />
      </ProtectedRoute>
      <ProtectedRoute path="/inventory">
        <InventoryPage path="/inventory" />
      </ProtectedRoute>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen">
          <AppRouter />
        </div>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
