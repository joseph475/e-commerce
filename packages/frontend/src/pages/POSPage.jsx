import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import AppLayout from '../components/layout/AppLayout';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { formatCurrency } from '../utils/currency';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const CheckoutModal = ({ isOpen, onClose, cart, onConfirm, loading }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      customerInfo,
      paymentMethod,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      })),
      subtotal,
      tax_amount: tax,
      total_amount: total
    });
  };

  return h(Modal, { open: isOpen, onClose: onClose, size: "md" },
    h('div', { className: "p-6" },
      h('h2', { className: "text-xl font-semibold text-gray-900 mb-4" }, "Checkout"),
      
      h('form', { onSubmit: handleSubmit, className: "space-y-4" },
        h(Input, {
          label: "Customer Name",
          value: customerInfo.name,
          onChange: (e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value })),
          required: true,
          fullWidth: true
        }),
        
        h(Input, {
          label: "Email",
          type: "email",
          value: customerInfo.email,
          onChange: (e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value })),
          fullWidth: true
        }),
        
        h(Input, {
          label: "Phone",
          type: "tel",
          value: customerInfo.phone,
          onChange: (e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value })),
          fullWidth: true
        }),
        
        h('div', null,
          h('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Payment Method"),
          h('select', {
            value: paymentMethod,
            onChange: (e) => setPaymentMethod(e.target.value),
            className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          },
            h('option', { value: "cash" }, "Cash"),
            h('option', { value: "card" }, "Credit/Debit Card"),
            h('option', { value: "digital" }, "Digital Wallet")
          )
        ),
        
        h('div', { className: "border-t border-gray-200 pt-4 space-y-2" },
          h('div', { className: "flex justify-between text-sm" },
            h('span', null, "Subtotal"),
            h('span', null, formatCurrency(subtotal))
          ),
          h('div', { className: "flex justify-between text-sm" },
            h('span', null, "Tax (10%)"),
            h('span', null, formatCurrency(tax))
          ),
          h('div', { className: "flex justify-between font-semibold text-lg border-t border-gray-200 pt-2" },
            h('span', null, "Total"),
            h('span', null, formatCurrency(total))
          )
        ),
        
        h('div', { className: "flex gap-3 pt-4" },
          h(Button, {
            type: "button",
            variant: "outline",
            fullWidth: true,
            onClick: onClose,
            disabled: loading
          }, "Cancel"),
          h(Button, {
            type: "submit",
            fullWidth: true,
            loading: loading
          }, "Complete Order")
        )
      )
    )
  );
};

const MobilePOSLayout = ({ 
  products, 
  cart, 
  onAddToCart, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  loading
}) => {
  const [activeTab, setActiveTab] = useState('products');

  return h('div', { className: "h-screen flex flex-col bg-gray-50" },
    // Header
    h('div', { className: "bg-white border-b border-gray-200 p-4" },
      h('h1', { className: "text-lg sm:text-xl md:text-2xl font-semibold text-gray-900" }, "POS System")
    ),

    // Search and Filters
    h('div', { className: "bg-white border-b border-gray-200 p-4 space-y-3" },
      h(Input, {
        placeholder: "Search products...",
        value: searchTerm,
        onChange: (e) => onSearchChange(e.target.value),
        fullWidth: true,
        leftIcon: h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
          h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
        )
      }),
      
      h('select', {
        value: selectedCategory,
        onChange: (e) => onCategoryChange(e.target.value),
        className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
      },
        h('option', { value: "" }, "All Categories"),
        categories.map(category => 
          h('option', { key: category, value: category }, category)
        )
      )
    ),

    // Tab Navigation
    h('div', { className: "bg-white border-b border-gray-200" },
      h('div', { className: "flex" },
        h('button', {
          onClick: () => setActiveTab('products'),
          className: `flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'products'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500'
          }`
        }, "Products"),
        h('button', {
          onClick: () => setActiveTab('cart'),
          className: `flex-1 py-3 px-4 text-sm font-medium border-b-2 relative ${
            activeTab === 'cart'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500'
          }`
        },
          "Cart",
          cart.length > 0 && h('span', { className: "absolute -top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" },
            cart.length
          )
        )
      )
    ),

    // Content
    h('div', { className: "flex-1 overflow-hidden" },
      activeTab === 'products' ? 
        h(ProductGrid, {
          products: products,
          onAddToCart: onAddToCart,
          loading: loading.products
        }) :
        h(Cart, {
          cart: cart,
          onUpdateQuantity: onUpdateQuantity,
          onRemove: onRemove,
          onCheckout: onCheckout
        })
    )
  );
};

const DesktopPOSLayout = ({ 
  products, 
  cart, 
  onAddToCart, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  loading
}) => {
  return h('div', { className: "h-screen flex flex-col bg-gray-50" },
    // Header
    h('div', { className: "bg-white border-b border-gray-200 p-6" },
      h('div', { className: "flex items-center justify-between" },
        h('h1', { className: "text-2xl font-semibold text-gray-900" }, "POS System"),
        h('div', { className: "flex items-center gap-4" },
          h('span', { className: "text-sm text-gray-600" },
            `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
          )
        )
      )
    ),

    // Search and Filters
    h('div', { className: "bg-white border-b border-gray-200 p-6" },
      h('div', { className: "flex gap-4" },
        h('div', { className: "flex-1" },
          h(Input, {
            placeholder: "Search products...",
            value: searchTerm,
            onChange: (e) => onSearchChange(e.target.value),
            fullWidth: true,
            leftIcon: h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
            )
          })
        ),
        h('div', { className: "w-48" },
          h('select', {
            value: selectedCategory,
            onChange: (e) => onCategoryChange(e.target.value),
            className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          },
            h('option', { value: "" }, "All Categories"),
            categories.map(category => 
              h('option', { key: category, value: category }, category)
            )
          )
        )
      )
    ),

    // Main Content
    h('div', { className: "flex-1 flex overflow-hidden" },
      // Products
      h('div', { className: "flex-1 overflow-y-auto" },
        h(ProductGrid, {
          products: products,
          onAddToCart: onAddToCart,
          loading: loading.products
        })
      ),

      // Cart Sidebar
      h('div', { className: "w-64 md:w-72 xl:w-80 border-l border-gray-200 bg-white h-full" },
        h(Cart, {
          cart: cart,
          onUpdateQuantity: onUpdateQuantity,
          onRemove: onRemove,
          onCheckout: onCheckout
        })
      )
    )
  );
};

const POSPage = () => {
  const { products, categories, loading, fetchProducts, fetchCategories, createOrder } = useData();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      await fetchCategories();
    };
    
    loadData();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity === 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleConfirmOrder = async (orderData) => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await createOrder({
        customer_name: orderData.customerInfo.name,
        customer_email: orderData.customerInfo.email,
        customer_phone: orderData.customerInfo.phone,
        items: orderData.items,
        payment_method: orderData.paymentMethod,
        tax_amount: orderData.tax_amount,
        discount_amount: 0,
        notes: ''
      });

      if (error) {
        throw new Error(error.message || 'Failed to create order');
      }
      
      // Clear cart and close modal
      setCart([]);
      setShowCheckout(false);
      
      // Show success message
      alert(`Order #${data.id.slice(-8)} completed successfully!`);
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return h('div', null,
    h(AppLayout, { currentPath: "/pos" },
      h(ResponsiveLayout, {
        mobileComponent: h(MobilePOSLayout, {
          products: filteredProducts,
          cart: cart,
          onAddToCart: handleAddToCart,
          onUpdateQuantity: handleUpdateQuantity,
          onRemove: handleRemoveFromCart,
          onCheckout: handleCheckout,
          searchTerm: searchTerm,
          onSearchChange: setSearchTerm,
          selectedCategory: selectedCategory,
          onCategoryChange: setSelectedCategory,
          categories: categories,
          loading: loading
        }),
        desktopComponent: h(DesktopPOSLayout, {
          products: filteredProducts,
          cart: cart,
          onAddToCart: handleAddToCart,
          onUpdateQuantity: handleUpdateQuantity,
          onRemove: handleRemoveFromCart,
          onCheckout: handleCheckout,
          searchTerm: searchTerm,
          onSearchChange: setSearchTerm,
          selectedCategory: selectedCategory,
          onCategoryChange: setSelectedCategory,
          categories: categories,
          loading: loading
        })
      })
    ),

    h(CheckoutModal, {
      isOpen: showCheckout,
      onClose: () => setShowCheckout(false),
      cart: cart,
      onConfirm: handleConfirmOrder,
      loading: checkoutLoading
    })
  );
};

export default POSPage;
