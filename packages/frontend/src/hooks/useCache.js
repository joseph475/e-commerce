import { useState, useEffect } from 'preact/hooks';
import globalCache from '../utils/globalCache';

// Hook that returns cached data without triggering any fetches
export const useCache = () => {
  const [, forceUpdate] = useState({});

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribe = globalCache.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const products = globalCache.getData('products');
  const orders = globalCache.getData('orders');
  const categories = globalCache.getData('categories');
  const users = globalCache.getData('users');
  
  const loading = {
    products: globalCache.getLoading('products'),
    orders: globalCache.getLoading('orders'),
    categories: globalCache.getLoading('categories'),
    users: globalCache.getLoading('users')
  };
  
  const initialized = globalCache.isInitialized('products') && globalCache.isInitialized('orders') && globalCache.isInitialized('categories');
  
  return {
    products,
    orders, 
    categories,
    users,
    loading,
    initialized,
    // Computed values
    lowStockProducts: products.filter(p => p.stock_type === 'tracked' && p.stock_quantity < 10),
    recentOrders: orders.slice(0, 10),
    productsByCategory: products.reduce((acc, product) => {
      const category = product.category?.toLowerCase() || 'uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {})
  };
};
