import { h, createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { useAuth } from './AuthContext';
import globalCache from '../utils/globalCache';

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

  // NO CACHE INITIALIZATION HERE - it's handled outside React
  // NO SUBSCRIPTIONS - components handle their own subscriptions
  // ONLY CRUD OPERATIONS

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

      // Add new order to cache
      if (result.data) {
        globalCache.addItem('orders', result.data);
      }

      // Update product stock quantities in cache
      if (orderData.items) {
        orderData.items.forEach(item => {
          const products = globalCache.getData('products');
          const product = products.find(p => p.id === item.product_id);
          if (product && product.stock_type === 'tracked' && product.stock_quantity !== null) {
            const updatedProduct = {
              ...product,
              stock_quantity: Math.max(0, product.stock_quantity - item.quantity)
            };
            globalCache.updateItem('products', updatedProduct);
          }
        });
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error creating order:', error);
      return { data: null, error };
    }
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

      // Add new product to cache
      if (result.data) {
        globalCache.addItem('products', result.data);
      }

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

      // Update product in cache
      if (result.data) {
        globalCache.updateItem('products', result.data);
      }

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

      // Remove product from cache
      globalCache.removeItem('products', productId);

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { data: null, error };
    }
  };

  const getOrderStats = async (filters = {}) => {
    try {
      const ordersData = await globalCache.fetchOrders(false, filters);
      
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
      globalCache.fetchProducts(true),
      globalCache.fetchOrders(true)
    ]);
  };

  const value = {
    // Only expose CRUD operations, not data access
    createOrder,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrderStats,
    refreshData
  };

  return h(DataContext.Provider, { value }, children);
};
