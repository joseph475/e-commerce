import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import AppLayout from '../components/layout/AppLayout';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import ReceiptModal from '../components/pos/ReceiptModal';
import QRPaymentModal from '../components/pos/QRPaymentModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { formatCurrency } from '../utils/currency';
import { useCache } from '../hooks/useCache';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const CheckoutModal = ({ isOpen, onClose, cart, onConfirm, onQRPayment, loading }) => {
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
    
    const orderData = {
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
    };

    if (paymentMethod === 'qr_payment') {
      onQRPayment(orderData);
    } else {
      onConfirm(orderData);
    }
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
          h('label', { className: "block text-sm font-medium text-gray-700 mb-3" }, "Payment Method"),
          h('div', { className: "space-y-3" },
            // Cash Payment
            h('label', { className: "flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" },
              h('input', {
                type: "radio",
                name: "paymentMethod",
                value: "cash",
                checked: paymentMethod === 'cash',
                onChange: (e) => setPaymentMethod(e.target.value),
                className: "mr-3"
              }),
              h('div', { className: "flex items-center" },
                h('span', { className: "text-2xl mr-3" }, "💵"),
                h('div', null,
                  h('div', { className: "font-medium" }, "Cash"),
                  h('div', { className: "text-sm text-gray-600" }, "Pay with cash")
                )
              )
            ),
            
            // QR Payment
            h('label', { className: "flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" },
              h('input', {
                type: "radio",
                name: "paymentMethod",
                value: "qr_payment",
                checked: paymentMethod === 'qr_payment',
                onChange: (e) => setPaymentMethod(e.target.value),
                className: "mr-3"
              }),
              h('div', { className: "flex items-center" },
                h('span', { className: "text-2xl mr-3" }, "📱"),
                h('div', null,
                  h('div', { className: "font-medium" }, "QR Payment"),
                  h('div', { className: "text-sm text-gray-600" }, "GCash, PayMaya, InstaPay & more")
                )
              )
            )
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
          }, paymentMethod === 'qr_payment' ? "Generate QR Code" : "Complete Order")
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

  return h('div', { className: "flex flex-col bg-gray-50 h-[calc(100vh-4rem)]" },

    // Search
    h('div', { className: "bg-white border-b border-gray-200 p-4" },
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
          cart.length > 0 && h('span', { className: "absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" },
            cart.length
          )
        )
      )
    ),

    // Content
    h('div', { className: "flex-1 overflow-y-auto" },
      activeTab === 'products' ? 
        h('div', null,
          // Category Tabs (only shown in products tab)
          h('div', { className: "bg-white border-b border-gray-200" },
            h('div', { className: "flex space-x-8 overflow-x-auto px-4" },
              h('button', {
                onClick: () => onCategoryChange(''),
                className: `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedCategory === ''
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }, "All Products"),
              categories.map(category => 
                h('button', {
                  key: category,
                  onClick: () => onCategoryChange(category),
                  className: `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedCategory === category
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }, category.charAt(0).toUpperCase() + category.slice(1).toLowerCase())
              )
            )
          ),
          h(ProductGrid, {
            products: products,
            onAddToCart: onAddToCart,
            loading: loading.products
          })
        ) :
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
  return h('div', { className: "flex flex-col bg-gray-50 h-[calc(100vh-4rem)]" },
    // Search
    h('div', { className: "bg-white border-b border-gray-200 p-6" },
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

    // Category Tabs
    h('div', { className: "bg-white border-b border-gray-200" },
      h('div', { className: "flex space-x-8 overflow-x-auto px-6" },
        h('button', {
          onClick: () => onCategoryChange(''),
          className: `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            selectedCategory === ''
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`
        }, "All Products"),
        categories.map(category => 
          h('button', {
            key: category,
            onClick: () => onCategoryChange(category),
            className: `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              selectedCategory === category
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }, category.charAt(0).toUpperCase() + category.slice(1).toLowerCase())
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
  const { products, categories, loading } = useCache();
  const { createOrder } = useData();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [qrOrderData, setQrOrderData] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // Get unique categories (case-insensitive)
  const uniqueCategories = [...new Set(
    products
      .map(p => p.category)
      .filter(Boolean)
      .map(cat => cat.toLowerCase())
  )].sort();

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category.toLowerCase() === selectedCategory.toLowerCase();
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

  const handleDirectPrint = (orderData) => {
    // Enhanced device detection
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone || 
                         document.referrer.includes('android-app://');
    
    const isTablet = /iPad|Android.*(?=.*\b(?:tablet|pad)\b)/i.test(navigator.userAgent) ||
                     (window.screen.width >= 768 && window.screen.width <= 1024);
    
    const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent) && !isTablet;

    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString();
    const timeStr = currentDate.toLocaleTimeString();

    // Check for Web Bluetooth support
    const hasBluetoothSupport = 'bluetooth' in navigator;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media print {
              @page {
                size: 80mm 297mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.1;
              margin: 0;
              padding: 4mm;
              width: 72mm;
              background: white;
              color: black;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .large { font-size: 13px; }
            .separator {
              border-top: 1px dashed #000;
              margin: 3mm 0;
              height: 1px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
            }
            .item-name {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 2mm;
            }
            .item-qty {
              margin-right: 2mm;
              min-width: 15mm;
            }
            .item-price {
              min-width: 15mm;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
            }
            .total-label {
              flex: 1;
            }
            .total-amount {
              min-width: 20mm;
              text-align: right;
            }
            .print-button {
              display: block;
              margin: 10mm auto;
              padding: 5mm 10mm;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 3mm;
              font-size: 12px;
              cursor: pointer;
            }
            @media print {
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="center bold large">YOUR BUSINESS NAME</div>
          <div class="center">123 Business Street</div>
          <div class="center">City, State 12345</div>
          <div class="center">Phone: (555) 123-4567</div>
          
          <div class="separator"></div>
          
          <div class="center bold">ORDER #${orderData.id.slice(-8)}</div>
          <div class="item-row">
            <span>Date:</span>
            <span>${dateStr}</span>
          </div>
          <div class="item-row">
            <span>Time:</span>
            <span>${timeStr}</span>
          </div>
          <div class="item-row">
            <span>Cashier:</span>
            <span>POS System</span>
          </div>
          
          <div class="separator"></div>
          
          ${orderData.customerInfo && orderData.customerInfo.name ? `
            <div class="bold">CUSTOMER:</div>
            <div>${orderData.customerInfo.name}</div>
            ${orderData.customerInfo.phone ? `<div>${orderData.customerInfo.phone}</div>` : ''}
            ${orderData.customerInfo.email ? `<div>${orderData.customerInfo.email}</div>` : ''}
            <div class="separator"></div>
          ` : ''}
          
          <div class="bold">ITEMS:</div>
          ${orderData.items.map(item => `
            <div class="item-row">
              <span class="item-name">${item.product_name || 'Item'}</span>
              <span class="item-qty">${item.quantity}x</span>
              <span class="item-price">${formatCurrency(item.unit_price)}</span>
            </div>
            <div class="right">${formatCurrency(item.quantity * item.unit_price)}</div>
          `).join('')}
          
          <div class="separator"></div>
          
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-amount">${formatCurrency(orderData.subtotal)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Tax (10%):</span>
            <span class="total-amount">${formatCurrency(orderData.tax_amount)}</span>
          </div>
          <div class="total-row bold large">
            <span class="total-label">TOTAL:</span>
            <span class="total-amount">${formatCurrency(orderData.total_amount)}</span>
          </div>
          
          <div class="separator"></div>
          
          <div class="total-row">
            <span class="total-label">Payment Method:</span>
            <span class="total-amount">${orderData.paymentMethod.toUpperCase()}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Amount Paid:</span>
            <span class="total-amount">${formatCurrency(orderData.total_amount)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Change:</span>
            <span class="total-amount">${formatCurrency(0)}</span>
          </div>
          
          <div class="separator"></div>
          
          <div class="center">Thank you for your business!</div>
          <div class="center">Please come again</div>
          
          <div class="separator"></div>
          
          <div class="center">*** CUSTOMER COPY ***</div>
          
          <button class="print-button" onclick="window.print(); setTimeout(() => window.close(), 500);">
            🖨️ Print Receipt
          </button>
          
          <div style="height: 10mm;"></div>
          
          <script>
            // Auto-print for desktop PWAs, manual for mobile
            if (${isStandalone} && !navigator.userAgent.match(/Mobile|Android|iPhone|iPad/)) {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 1000);
              }, 100);
            }
          </script>
        </body>
      </html>
    `;

    if (isStandalone && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
      // For mobile PWAs, open in same window with print button
      const printWindow = window.open('', '_blank');
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    } else {
      // For desktop PWAs and browsers, use auto-print
      const printWindow = window.open('', '_blank');
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const handleQRPayment = (orderData) => {
    // Close checkout modal and show QR payment modal
    setShowCheckout(false);
    setQrOrderData(orderData);
    setShowQRPayment(true);
  };

  const handleQRPaymentComplete = async (completedOrderData) => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await createOrder({
        customer_name: completedOrderData.customerInfo.name,
        customer_email: completedOrderData.customerInfo.email,
        customer_phone: completedOrderData.customerInfo.phone,
        items: completedOrderData.items,
        payment_method: 'qr_payment',
        tax_amount: completedOrderData.tax_amount,
        discount_amount: 0,
        notes: `QR Payment - Transaction ID: ${completedOrderData.transactionId}`,
        status: 'completed'
      });

      if (error) {
        throw new Error(error.message || 'Failed to create order');
      }
      
      // Prepare receipt data with product names
      const receiptData = {
        id: data.id,
        customerInfo: completedOrderData.customerInfo,
        paymentMethod: 'qr_payment',
        transactionId: completedOrderData.transactionId,
        items: completedOrderData.items.map(item => ({
          ...item,
          product_name: cart.find(cartItem => cartItem.id === item.product_id)?.name || 'Unknown Product'
        })),
        subtotal: completedOrderData.subtotal,
        tax_amount: completedOrderData.tax_amount,
        total_amount: completedOrderData.total_amount
      };
      
      // Clear cart and close QR payment modal
      setCart([]);
      setShowQRPayment(false);
      setQrOrderData(null);
      
      // Store order data and directly print receipt
      setLastOrder(receiptData);
      handleDirectPrint(receiptData);
      
      // Show success message
      setToast({ isOpen: true, message: `QR Payment completed! Order #${data.id.slice(-8)}`, type: 'success' });
    } catch (error) {
      console.error('Error completing QR payment order:', error);
      setToast({ isOpen: true, message: 'Error completing order. Please try again.', type: 'error' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleQRPaymentCancel = () => {
    setShowQRPayment(false);
    setQrOrderData(null);
    setShowCheckout(true); // Return to checkout modal
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
        notes: '',
        status: 'completed'
      });

      if (error) {
        throw new Error(error.message || 'Failed to create order');
      }
      
      // Prepare receipt data with product names
      const receiptData = {
        id: data.id,
        customerInfo: orderData.customerInfo,
        paymentMethod: orderData.paymentMethod,
        items: orderData.items.map(item => ({
          ...item,
          product_name: cart.find(cartItem => cartItem.id === item.product_id)?.name || 'Unknown Product'
        })),
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        total_amount: orderData.total_amount
      };
      
      // Clear cart and close checkout modal
      setCart([]);
      setShowCheckout(false);
      
      // Store order data and directly print receipt
      setLastOrder(receiptData);
      handleDirectPrint(receiptData);
      
      // Show success message
      setToast({ isOpen: true, message: `Order #${data.id.slice(-8)} completed successfully!`, type: 'success' });
    } catch (error) {
      console.error('Error completing order:', error);
      setToast({ isOpen: true, message: 'Error completing order. Please try again.', type: 'error' });
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
          categories: uniqueCategories,
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
          categories: uniqueCategories,
          loading: loading
        })
      })
    ),

    h(CheckoutModal, {
      isOpen: showCheckout,
      onClose: () => setShowCheckout(false),
      cart: cart,
      onConfirm: handleConfirmOrder,
      onQRPayment: handleQRPayment,
      loading: checkoutLoading
    }),

    h(QRPaymentModal, {
      isOpen: showQRPayment,
      onClose: () => setShowQRPayment(false),
      orderData: qrOrderData,
      onPaymentComplete: handleQRPaymentComplete,
      onPaymentCancel: handleQRPaymentCancel
    }),

    h(ReceiptModal, {
      isOpen: showReceipt,
      onClose: () => setShowReceipt(false),
      orderData: lastOrder
    }),

    h(Toast, {
      isOpen: toast.isOpen,
      onClose: () => setToast({ ...toast, isOpen: false }),
      message: toast.message,
      type: toast.type
    })
  );
};

export default POSPage;
