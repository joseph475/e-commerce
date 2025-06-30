// Global singleton cache that persists across all component re-renders and navigation
class GlobalCache {
  constructor() {
    this.data = {
      products: [],
      orders: [],
      categories: [],
      users: []
    };
    this.timestamps = {
      products: null,
      orders: null,
      categories: null,
      users: null
    };
    this.loading = {
      products: false,
      orders: false,
      categories: false,
      users: false
    };
    this.initialized = {
      products: false,
      orders: false,
      categories: false,
      users: false
    };
    this.subscribers = new Set();
    this.CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  }

  // Subscribe to cache updates
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify all subscribers of changes
  notify() {
    this.subscribers.forEach(callback => callback());
  }

  // Check if data is fresh
  isDataFresh(key) {
    const timestamp = this.timestamps[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  // Get cached data
  getData(key) {
    return this.data[key] || [];
  }

  // Set data and notify subscribers
  setData(key, data) {
    this.data[key] = data;
    this.timestamps[key] = Date.now();
    this.initialized[key] = true;
    this.notify();
  }

  // Update loading state
  setLoading(key, loading) {
    this.loading[key] = loading;
    this.notify();
  }

  // Get loading state
  getLoading(key) {
    return this.loading[key];
  }

  // Check if initialized
  isInitialized(key) {
    return this.initialized[key];
  }

  // Add item to cache
  addItem(key, item) {
    this.data[key] = [item, ...this.data[key]];
    this.notify();
  }

  // Update item in cache
  updateItem(key, updatedItem, idField = 'id') {
    this.data[key] = this.data[key].map(item => 
      item[idField] === updatedItem[idField] ? updatedItem : item
    );
    this.notify();
  }

  // Remove item from cache
  removeItem(key, itemId, idField = 'id') {
    this.data[key] = this.data[key].filter(item => item[idField] !== itemId);
    this.notify();
  }

  // Clear all cache
  clear() {
    this.data = {
      products: [],
      orders: [],
      categories: [],
      users: []
    };
    this.timestamps = {
      products: null,
      orders: null,
      categories: null,
      users: null
    };
    this.initialized = {
      products: false,
      orders: false,
      categories: false,
      users: false
    };
    this.notify();
  }

  // Fetch products (only if not cached or stale)
  async fetchProducts(force = false) {
    if (!force && this.isDataFresh('products') && this.data.products.length > 0) {
      return this.data.products;
    }

    if (this.loading.products) {
      return this.data.products;
    }

    try {
      this.setLoading('products', true);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      const products = result.data || [];
      this.setData('products', products);
      
      // Auto-generate categories
      const categories = [...new Set(
        products
          .map(p => p.category)
          .filter(Boolean)
          .map(cat => cat.toLowerCase())
      )].sort();
      this.setData('categories', categories);
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return this.data.products;
    } finally {
      this.setLoading('products', false);
    }
  }

  // Fetch orders (only if not cached or stale)
  async fetchOrders(force = false, filters = {}) {
    const hasFilters = Object.keys(filters).length > 0;
    
    if (!force && !hasFilters && this.isDataFresh('orders') && this.data.orders.length > 0) {
      return this.data.orders;
    }

    if (!hasFilters && this.loading.orders) {
      return this.data.orders;
    }

    try {
      if (!hasFilters) {
        this.setLoading('orders', true);
      }
      
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

      const orders = result.data || [];
      
      if (!hasFilters) {
        this.setData('orders', orders);
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return hasFilters ? [] : this.data.orders;
    } finally {
      if (!hasFilters) {
        this.setLoading('orders', false);
      }
    }
  }

  // Fetch users (only if not cached or stale)
  async fetchUsers(force = false, token = null) {
    if (!force && this.isDataFresh('users') && this.data.users.length > 0) {
      return this.data.users;
    }

    if (this.loading.users) {
      return this.data.users;
    }

    if (!token) {
      console.warn('No token provided for fetchUsers');
      return this.data.users;
    }

    try {
      this.setLoading('users', true);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      const users = result.data || [];
      this.setData('users', users);
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return this.data.users;
    } finally {
      this.setLoading('users', false);
    }
  }
}

// Create singleton instance
const globalCache = new GlobalCache();

// Initialize cache immediately when module loads (outside React lifecycle)
let initializationPromise = null;

export const initializeCache = async (token = null) => {
  if (initializationPromise) {
    return initializationPromise;
  }

  if (globalCache.isInitialized('products') && globalCache.isInitialized('orders')) {
    return Promise.resolve();
  }

  const promises = [
    globalCache.fetchProducts(),
    globalCache.fetchOrders()
  ];

  // Only fetch users if we have a token (admin user)
  if (token) {
    promises.push(globalCache.fetchUsers(false, token));
  }

  initializationPromise = Promise.all(promises);
  return initializationPromise;
};

export default globalCache;
