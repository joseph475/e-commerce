import { h, createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState({
    products: false,
    orders: false,
    categories: false
  });
  const [lastFetch, setLastFetch] = useState({
    products: null,
    orders: null,
    categories: null
  });

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const shouldRefetch = (key) => {
    const lastFetchTime = lastFetch[key];
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > CACHE_DURATION;
  };

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setLastFetchTime = (key) => {
    setLastFetch(prev => ({ ...prev, [key]: Date.now() }));
  };

  const fetchProducts = async (force = false) => {
    if (!force && !shouldRefetch('products') && products.length > 0) {
      return products;
    }

    try {
      setLoadingState('products', true);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      setProducts(result.data || []);
      setLastFetchTime('products');
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    } finally {
      setLoadingState('products', false);
    }
  };

  const fetchCategories = async (force = false) => {
    if (!force && !shouldRefetch('categories') && categories.length > 0) {
      return categories;
    }

    try {
      setLoadingState('categories', true);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/categories/list`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch categories');
      }

      setCategories(result.data || []);
      setLastFetchTime('categories');
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    } finally {
      setLoadingState('categories', false);
    }
  };

  const fetchOrders = async (force = false, filters = {}) => {
    if (!force && !shouldRefetch('orders') && orders.length > 0 && Object.keys(filters).length === 0) {
      return orders;
    }

    try {
      setLoadingState('orders', true);
      
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders?${queryParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch orders');
      }

      if (Object.keys(filters).length === 0) {
        setOrders(result.data || []);
        setLastFetchTime('orders');
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    } finally {
      setLoadingState('orders', false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Invalidate cache to force refresh
      setLastFetch(prev => ({ 
        ...prev, 
        orders: null, 
        products: null 
      }));

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error creating order:', error);
      return { data: null, error };
    }
  };

  const getOrderStats = async (filters = {}) => {
    try {
      const ordersData = await fetchOrders(false, filters);
      
      const stats = {
        total_orders: ordersData.length,
        total_revenue: ordersData.reduce((sum, order) => sum + order.total_amount, 0),
        completed_orders: ordersData.filter(order => order.status === 'completed').length,
        pending_orders: ordersData.filter(order => order.status === 'pending').length,
        cancelled_orders: ordersData.filter(order => order.status === 'cancelled').length,
        average_order_value: ordersData.length > 0 ? 
          ordersData.reduce((sum, order) => sum + order.total_amount, 0) / ordersData.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error calculating order stats:', error);
      return {
        total_orders: 0,
        total_revenue: 0,
        completed_orders: 0,
        pending_orders: 0,
        cancelled_orders: 0,
        average_order_value: 0
      };
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchProducts(true),
      fetchCategories(true),
      fetchOrders(true)
    ]);
  };

  const createProduct = async (productData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product');
      }

      // Invalidate cache to force refresh
      setLastFetch(prev => ({ 
        ...prev, 
        products: null, 
        categories: null 
      }));

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product');
      }

      // Invalidate cache to force refresh
      setLastFetch(prev => ({ 
        ...prev, 
        products: null, 
        categories: null 
      }));

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete product');
      }

      // Invalidate cache to force refresh
      setLastFetch(prev => ({ 
        ...prev, 
        products: null, 
        categories: null 
      }));

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { data: null, error };
    }
  };

  const value = {
    products,
    orders,
    categories,
    loading,
    fetchProducts,
    fetchCategories,
    fetchOrders,
    createOrder,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrderStats,
    refreshData
  };

  return h(DataContext.Provider, { value }, children);
};
