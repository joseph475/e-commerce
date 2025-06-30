import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import AppLayout from '../components/layout/AppLayout';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Grid from '../components/ui/Grid';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import { formatCurrency } from '../utils/currency';
import { useCache } from '../hooks/useCache';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ title, value, change, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <Card className="relative overflow-hidden" padding="md">
      <div className="flex flex-col space-y-3">
        {/* Header with icon */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        
        {/* Value and change */}
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from yesterday
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

const QuickAction = ({ title, description, icon, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
  };

  return (
    <Card hover className="cursor-pointer transition-all duration-200" onClick={onClick}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg mr-4 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  );
};

const RecentActivity = ({ activities }) => (
  <Card>
    <Card.Header>
      <Card.Title>Recent Activity</Card.Title>
    </Card.Header>
    <Card.Content>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card.Content>
  </Card>
);

const MobileDashboard = () => {
  const { products, orders, lowStockProducts, recentOrders, initialized } = useCache();
  const { user } = useAuth();
  
  // Calculate stats from cached data only
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= todayStart;
  });
  
  const stats = {
    todaySales: todayOrders.reduce((sum, order) => sum + order.total_amount, 0),
    todayOrders: todayOrders.length,
    lowStock: lowStockProducts.length,
    activeUsers: 1
  };

  // Generate recent activities from cached orders
  const recentActivities = recentOrders.map((order, index) => {
    const timeAgo = new Date(order.created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now - timeAgo) / (1000 * 60));
    
    let timeText;
    if (diffMinutes < 60) {
      timeText = `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      timeText = `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      timeText = `${Math.floor(diffMinutes / 1440)} days ago`;
    }
    
    return {
      description: `Order #${order.id.slice(-8)} ${order.status}`,
      time: timeText,
      color: order.status === 'completed' ? 'bg-green-500' : 
             order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
    };
  });

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to POS Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor your business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.todaySales)}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
        <StatCard
          title="Orders"
          value={stats.todayOrders.toString()}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock.toString()}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toString()}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <QuickAction
          title="Start Selling"
          description="Open POS interface"
          color="blue"
          onClick={() => window.location.href = '/pos'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          }
        />
        <QuickAction
          title="View Reports"
          description="Sales and analytics"
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <QuickAction
          title="Manage Inventory"
          description="Products and stock"
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={recentActivities} />
    </div>
  );
};

const DesktopDashboard = ({ apiStatus }) => {
  const mockStats = {
    todaySales: formatCurrency(1234.56),
    todayOrders: '23',
    lowStock: '5',
    activeUsers: '3'
  };

  const mockActivities = [
    { description: 'New order #1234 completed', time: '2 minutes ago', color: 'bg-green-500' },
    { description: 'Product "Coffee" low stock alert', time: '15 minutes ago', color: 'bg-yellow-500' },
    { description: 'User John logged in', time: '1 hour ago', color: 'bg-blue-500' },
    { description: 'Order #1233 refunded', time: '2 hours ago', color: 'bg-red-500' },
    { description: 'Inventory updated for "Sandwich"', time: '3 hours ago', color: 'bg-blue-500' }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <Grid cols={{ sm: 2, md: 2, lg: 4 }} gap={6}>
        <StatCard
          title="Today's Sales"
          value={mockStats.todaySales}
          change="+12.5%"
          color="green"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
        <StatCard
          title="Orders Today"
          value={mockStats.todayOrders}
          change="+8"
          color="blue"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatCard
          title="Low Stock Items"
          value={mockStats.lowStock}
          color="yellow"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatCard
          title="Active Users"
          value={mockStats.activeUsers}
          color="blue"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
        />
      </Grid>

      {/* Main Content Grid */}
      <Grid cols={3} gap={8}>
        {/* Quick Actions */}
        <Grid.Item colSpan={2}>
          <Card>
            <Card.Header>
              <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content>
              <Grid cols={2} gap={4}>
                <QuickAction
                  title="Start Selling"
                  description="Open POS interface to process sales"
                  color="blue"
                  onClick={() => window.location.href = '/pos'}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  }
                />
                <QuickAction
                  title="View Reports"
                  description="Sales analytics and insights"
                  color="green"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
                <QuickAction
                  title="Manage Inventory"
                  description="Products, stock, and categories"
                  color="purple"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  }
                />
                <QuickAction
                  title="User Management"
                  description="Staff accounts and permissions"
                  color="orange"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  }
                />
              </Grid>
            </Card.Content>
          </Card>
        </Grid.Item>

        {/* Recent Activity */}
        <RecentActivity activities={mockActivities} />
      </Grid>
    </div>
  );
};

const HomePage = () => {
  return (
    <AppLayout currentPath="/">
      <main className="bg-gray-50">
        <ResponsiveLayout
          mobileComponent={<MobileDashboard />}
          desktopComponent={<DesktopDashboard />}
        />
      </main>
      <Footer />
    </AppLayout>
  );
};

export default HomePage;
