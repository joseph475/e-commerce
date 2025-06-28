import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Dialog, Listbox } from '../ui';
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  CreditCardIcon 
} from '@heroicons/react/24/outline';

const CartModal = ({ isOpen, onClose, cart = [], onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'digital', label: 'Digital Wallet' }
  ];

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onCheckout({
      items: cart,
      paymentMethod,
      subtotal,
      tax,
      total
    });
    onClose();
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Shopping Cart" 
      size="lg"
    >
      <div className="max-h-96 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Add some items to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded-full hover:bg-red-100 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 ml-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <Listbox
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={paymentMethods}
              className="w-full"
            />
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 btn btn-primary flex items-center justify-center"
            >
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Checkout
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CartModal;
