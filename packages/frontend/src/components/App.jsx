import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Router from 'preact-router';

// Contexts
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';

// Components
import ProtectedRoute from './auth/ProtectedRoute';
import RoleProtectedRoute from './auth/RoleProtectedRoute';
import Dashboard from '../pages/Dashboard';
import POSPage from '../pages/POSPage';
import InventoryPage from '../pages/InventoryPage';
import SalesPage from '../pages/SalesPage';
import ReportsPage from '../pages/ReportsPage';

const AppRouter = () => {
  return (
    <Router>
      <ProtectedRoute path="/">
        <Dashboard path="/" />
      </ProtectedRoute>
      <ProtectedRoute path="/pos">
        <POSPage path="/pos" />
      </ProtectedRoute>
      <ProtectedRoute path="/sales">
        <SalesPage path="/sales" />
      </ProtectedRoute>
      <RoleProtectedRoute path="/inventory" allowedRoles={['admin']}>
        <InventoryPage path="/inventory" />
      </RoleProtectedRoute>
      <RoleProtectedRoute path="/reports" allowedRoles={['admin']}>
        <ReportsPage path="/reports" />
      </RoleProtectedRoute>
      <RoleProtectedRoute path="/users" allowedRoles={['admin']}>
        <div path="/users" className="p-8">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">User management functionality coming soon...</p>
        </div>
      </RoleProtectedRoute>
      <RoleProtectedRoute path="/settings" allowedRoles={['admin']}>
        <div path="/settings" className="p-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-2">Settings functionality coming soon...</p>
        </div>
      </RoleProtectedRoute>
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
