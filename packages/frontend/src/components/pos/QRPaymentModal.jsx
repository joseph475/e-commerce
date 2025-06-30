import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Toast from '../ui/Toast';
import { formatCurrency } from '../../utils/currency';

// QR Code generation utility
const generateQRCode = async (paymentData) => {
  // Using qrcode library for QR generation
  const QRCode = await import('qrcode');
  
  // QRPH EMV format for Philippine payments
  const qrData = generateQRPHData(paymentData);
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate QRPH-compliant payment data
const generateQRPHData = (paymentData) => {
  const {
    merchantId = 'MERCHANT001',
    merchantName = 'Your Business Name',
    amount,
    currency = 'PHP',
    transactionId,
    description = 'POS Payment'
  } = paymentData;

  // EMV QR Code format for Philippines
  // This is a simplified version - in production, you'd use proper EMV formatting
  const qrphData = {
    // Payload Format Indicator
    '00': '01',
    // Point of Initiation Method
    '01': '12', // Dynamic QR
    // Merchant Account Information
    '26': {
      '00': 'PH.QR.01', // QRPH identifier
      '01': merchantId,
      '02': merchantName
    },
    // Merchant Category Code
    '52': '5999', // Miscellaneous retail
    // Transaction Currency
    '53': '608', // PHP currency code
    // Transaction Amount
    '54': amount.toFixed(2),
    // Country Code
    '58': 'PH',
    // Merchant Name
    '59': merchantName.substring(0, 25),
    // Merchant City
    '60': 'Manila',
    // Additional Data Field
    '62': {
      '01': transactionId, // Bill Number
      '05': description.substring(0, 25) // Reference Label
    }
  };

  // Convert to EMV format string
  return convertToEMVString(qrphData);
};

// Convert QR data object to EMV string format
const convertToEMVString = (data) => {
  let emvString = '';
  
  for (const [tag, value] of Object.entries(data)) {
    if (typeof value === 'object') {
      // Handle nested objects
      let nestedString = '';
      for (const [nestedTag, nestedValue] of Object.entries(value)) {
        const nestedLength = nestedValue.length.toString().padStart(2, '0');
        nestedString += nestedTag + nestedLength + nestedValue;
      }
      const length = nestedString.length.toString().padStart(2, '0');
      emvString += tag + length + nestedString;
    } else {
      const length = value.length.toString().padStart(2, '0');
      emvString += tag + length + value;
    }
  }
  
  // Add CRC (simplified - in production use proper CRC16)
  const crc = calculateCRC16(emvString + '6304');
  emvString += '63' + '04' + crc;
  
  return emvString;
};

// Simplified CRC16 calculation
const calculateCRC16 = (data) => {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

const QRPaymentModal = ({ 
  isOpen, 
  onClose, 
  orderData, 
  onPaymentComplete,
  onPaymentCancel 
}) => {
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed
  const [countdown, setCountdown] = useState(300); // 5 minutes timeout
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'gcash', name: 'GCash', logo: '💳', enabled: true },
    { id: 'paymaya', name: 'PayMaya', logo: '💰', enabled: true },
    { id: 'instapay', name: 'InstaPay', logo: '🏦', enabled: true },
    { id: 'pesonet', name: 'PESONet', logo: '🏛️', enabled: true },
    { id: 'unionbank', name: 'UnionBank', logo: '🏦', enabled: true },
    { id: 'bpi', name: 'BPI', logo: '🏦', enabled: true }
  ]);

  useEffect(() => {
    if (isOpen && orderData) {
      generatePaymentQR();
      startPaymentMonitoring();
    }
    
    return () => {
      if (paymentMonitoringInterval) {
        clearInterval(paymentMonitoringInterval);
      }
    };
  }, [isOpen, orderData]);

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0 && paymentStatus === 'pending') {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && paymentStatus === 'pending') {
      handlePaymentTimeout();
    }
    
    return () => clearTimeout(timer);
  }, [countdown, isOpen, paymentStatus]);

  let paymentMonitoringInterval;

  const generatePaymentQR = async () => {
    try {
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
      
      const paymentData = {
        merchantId: 'MERCHANT001', // Replace with your actual merchant ID
        merchantName: 'Your Business Name', // Replace with your business name
        amount: orderData.total_amount,
        currency: 'PHP',
        transactionId: transactionId,
        description: `Order #${orderData.id?.slice(-8) || 'NEW'}`
      };

      const qrImage = await generateQRCode(paymentData);
      setQrCodeImage(qrImage);
      
      // Store transaction ID for monitoring
      window.currentTransactionId = transactionId;
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      setToast({
        isOpen: true,
        message: 'Failed to generate QR code. Please try again.',
        type: 'error'
      });
    }
  };

  const startPaymentMonitoring = () => {
    // In a real implementation, you would poll your payment gateway API
    // For demo purposes, we'll simulate payment status checking
    paymentMonitoringInterval = setInterval(() => {
      checkPaymentStatus();
    }, 3000); // Check every 3 seconds
  };

  const checkPaymentStatus = async () => {
    // In production, this would call your payment gateway API
    // For demo, we'll simulate random payment completion after some time
    if (Math.random() < 0.1 && paymentStatus === 'pending') { // 10% chance per check
      handlePaymentSuccess();
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('completed');
    clearInterval(paymentMonitoringInterval);
    
    setToast({
      isOpen: true,
      message: 'Payment received successfully!',
      type: 'success'
    });

    // Complete the order
    setTimeout(() => {
      onPaymentComplete({
        ...orderData,
        paymentMethod: 'qr_payment',
        paymentStatus: 'completed',
        transactionId: window.currentTransactionId
      });
    }, 2000);
  };

  const handlePaymentTimeout = () => {
    setPaymentStatus('failed');
    clearInterval(paymentMonitoringInterval);
    
    setToast({
      isOpen: true,
      message: 'Payment session expired. Please try again.',
      type: 'error'
    });
  };

  const handleManualConfirm = () => {
    // Allow manual confirmation for demo purposes
    setPaymentStatus('processing');
    setToast({
      isOpen: true,
      message: 'Processing payment confirmation...',
      type: 'info'
    });
    
    setTimeout(() => {
      handlePaymentSuccess();
    }, 2000);
  };

  const handleCancel = () => {
    clearInterval(paymentMonitoringInterval);
    setPaymentStatus('pending');
    setCountdown(300);
    setQrCodeImage(null);
    onPaymentCancel();
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!orderData) return null;

  return h('div', null,
    h(Modal, { open: isOpen, onClose: handleCancel, size: "lg" },
      h('div', { className: "p-6" },
        h('div', { className: "text-center mb-6" },
          h('h2', { className: "text-2xl font-bold text-gray-900 mb-2" }, "QR Payment"),
          h('p', { className: "text-gray-600" }, "Scan the QR code with your mobile banking app")
        ),

        // Payment Status
        h('div', { className: "mb-6" },
          h(Card, { className: "p-4" },
            h('div', { className: "flex items-center justify-between mb-4" },
              h('div', null,
                h('h3', { className: "font-semibold text-gray-900" }, "Payment Status"),
                h('p', { 
                  className: `text-sm font-medium ${
                    paymentStatus === 'completed' ? 'text-green-600' :
                    paymentStatus === 'processing' ? 'text-blue-600' :
                    paymentStatus === 'failed' ? 'text-red-600' :
                    'text-yellow-600'
                  }`
                }, 
                  paymentStatus === 'completed' ? '✅ Payment Completed' :
                  paymentStatus === 'processing' ? '⏳ Processing Payment' :
                  paymentStatus === 'failed' ? '❌ Payment Failed' :
                  '⏱️ Waiting for Payment'
                )
              ),
              paymentStatus === 'pending' && h('div', { className: "text-right" },
                h('div', { className: "text-2xl font-bold text-blue-600" }, formatTime(countdown)),
                h('div', { className: "text-xs text-gray-500" }, "Time remaining")
              )
            ),
            
            h('div', { className: "text-center" },
              h('div', { className: "text-3xl font-bold text-gray-900" }, 
                formatCurrency(orderData.total_amount)
              ),
              h('div', { className: "text-sm text-gray-600" }, 
                `Order #${orderData.id?.slice(-8) || 'NEW'}`
              )
            )
          )
        ),

        // QR Code Display
        paymentStatus !== 'completed' && h('div', { className: "mb-6" },
          h(Card, { className: "p-6" },
            h('div', { className: "text-center" },
              qrCodeImage ? 
                h('div', null,
                  h('img', { 
                    src: qrCodeImage, 
                    alt: "QR Payment Code",
                    className: "mx-auto mb-4 border-2 border-gray-200 rounded-lg"
                  }),
                  h('p', { className: "text-sm text-gray-600 mb-4" }, 
                    "Scan this QR code with any of the supported payment apps"
                  )
                ) :
                h('div', { className: "py-12" },
                  h('div', { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }),
                  h('p', { className: "text-gray-600" }, "Generating QR code...")
                )
            )
          )
        ),

        // Supported Payment Methods
        paymentStatus !== 'completed' && h('div', { className: "mb-6" },
          h('h4', { className: "font-medium text-gray-900 mb-3" }, "Supported Payment Methods"),
          h('div', { className: "grid grid-cols-3 gap-3" },
            paymentMethods.filter(method => method.enabled).map(method =>
              h('div', { 
                key: method.id,
                className: "flex items-center justify-center p-3 border border-gray-200 rounded-lg bg-gray-50"
              },
                h('span', { className: "text-lg mr-2" }, method.logo),
                h('span', { className: "text-sm font-medium text-gray-700" }, method.name)
              )
            )
          )
        ),

        // Payment Instructions
        paymentStatus === 'pending' && h('div', { className: "mb-6" },
          h(Card, { className: "p-4 bg-blue-50 border-blue-200" },
            h('h4', { className: "font-medium text-blue-900 mb-2" }, "Payment Instructions"),
            h('ol', { className: "text-sm text-blue-800 space-y-1" },
              h('li', null, "1. Open your mobile banking or e-wallet app"),
              h('li', null, "2. Select 'Scan QR' or 'Pay via QR'"),
              h('li', null, "3. Scan the QR code above"),
              h('li', null, "4. Confirm the payment amount"),
              h('li', null, "5. Complete the payment in your app")
            )
          )
        ),

        // Success Message
        paymentStatus === 'completed' && h('div', { className: "mb-6" },
          h(Card, { className: "p-6 bg-green-50 border-green-200 text-center" },
            h('div', { className: "text-6xl mb-4" }, "✅"),
            h('h3', { className: "text-xl font-bold text-green-900 mb-2" }, "Payment Successful!"),
            h('p', { className: "text-green-800" }, "Your payment has been received and processed."),
            h('p', { className: "text-sm text-green-700 mt-2" }, 
              `Transaction ID: ${window.currentTransactionId}`
            )
          )
        ),

        // Action Buttons
        h('div', { className: "flex gap-3" },
          paymentStatus === 'completed' ? 
            h(Button, {
              fullWidth: true,
              onClick: onClose
            }, "Continue") :
            h('div', { className: "flex gap-3 w-full" },
              h(Button, {
                variant: "outline",
                fullWidth: true,
                onClick: handleCancel
              }, "Cancel"),
              // Demo: Manual confirm button (remove in production)
              h(Button, {
                fullWidth: true,
                onClick: handleManualConfirm,
                disabled: paymentStatus !== 'pending'
              }, "Confirm Payment (Demo)")
            )
        )
      )
    ),

    h(Toast, {
      isOpen: toast.isOpen,
      onClose: () => setToast({ ...toast, isOpen: false }),
      message: toast.message,
      type: toast.type
    })
  );
};

export default QRPaymentModal;
