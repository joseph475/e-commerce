import { h } from 'preact';
import { useState } from 'preact/hooks';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ResponsiveLayout from '../layout/ResponsiveLayout';
import { CURRENCY, formatCurrency } from '../../utils/currency';

const CartItem = ({ item, onUpdateQuantity, onRemove, isMobile = false }) => {
  return (
    <div className={`${isMobile ? 'p-3 space-y-2' : 'p-4 space-y-3'} border-b border-gray-200 last:border-b-0`}>
      {/* Product name and remove button */}
      <div className="flex items-center justify-between">
        <h4 className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>{item.name}</h4>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* Price per unit */}
      <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
        {formatCurrency(item.price)} each
      </div>
      
      {/* Quantity controls and total */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
          <button
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100`}
          >
            <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className={`${isMobile ? 'w-6 text-sm' : 'w-8 text-base'} text-center font-medium`}>{item.quantity}</span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100`}
          >
            <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        <div className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-lg'}`}>
          {formatCurrency(item.price * item.quantity)}
        </div>
      </div>
    </div>
  );
};

const CartSummary = ({ cart, onCheckout, loading, isMobile = false }) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className={`border-t border-gray-200 ${isMobile ? 'pt-2 space-y-2 p-3' : 'pt-4 space-y-3 p-6'}`}>
      <div className={`${isMobile ? 'space-y-1' : 'space-y-2'}`}>
        <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <span>Tax (10%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className={`flex justify-between font-semibold ${isMobile ? 'text-sm border-t border-gray-200 pt-1' : 'text-lg border-t border-gray-200 pt-2'}`}>
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      
      <Button
        fullWidth
        size={isMobile ? 'md' : 'xl'}
        onClick={onCheckout}
        loading={loading}
        disabled={cart.length === 0}
      >
        Checkout
      </Button>
    </div>
  );
};

const Cart = ({ 
  cart = [], 
  onUpdateQuantity, 
  onRemove, 
  onCheckout, 
  loading = false 
}) => {
  // Detect mobile view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (cart.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600">Add some products to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
      {/* Header */}
      <div style={{ 
        padding: isMobile ? '0.75rem' : '1.5rem', 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: 'white' 
      }}>
        <h2 style={{ 
          fontSize: isMobile ? '1rem' : '1.25rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: 0 
        }}>
          Cart ({cart.length} items)
        </h2>
      </div>
      
      {/* Scrollable Items */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        backgroundColor: 'white',
        minHeight: 0
      }}>
        {cart.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            isMobile={isMobile}
          />
        ))}
      </div>
      
      {/* Footer */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
        <CartSummary
          cart={cart}
          onCheckout={onCheckout}
          loading={loading}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default Cart;
