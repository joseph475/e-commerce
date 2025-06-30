import { h } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/currency';

const ReceiptModal = ({ isOpen, onClose, orderData }) => {
  const receiptRef = useRef();

  if (!orderData) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const receiptContent = receiptRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 0;
              padding: 8px;
              width: 80mm;
              background: white;
            }
            .receipt {
              width: 100%;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .large { font-size: 14px; }
            .separator {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .item-name {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 8px;
            }
            .item-qty {
              margin-right: 8px;
              min-width: 20px;
            }
            .item-price {
              min-width: 60px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .total-label {
              flex: 1;
            }
            .total-amount {
              min-width: 80px;
              text-align: right;
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Automatically open print dialog
    setTimeout(() => {
      printWindow.print();
    }, 100);
  };

  const handleAutoPrint = () => {
    // Automatically trigger print when modal opens
    setTimeout(() => {
      handlePrint();
    }, 500);
  };

  // Auto-print when modal opens
  useEffect(() => {
    if (isOpen && orderData) {
      handleAutoPrint();
    }
  }, [isOpen, orderData]);

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString();
  const timeStr = currentDate.toLocaleTimeString();

  return h(Modal, { open: isOpen, onClose: onClose, size: "sm" },
    h('div', { className: "p-6" },
      h('div', { className: "flex items-center justify-between mb-4" },
        h('h2', { className: "text-xl font-semibold text-gray-900" }, "Order Receipt"),
        h('div', { className: "flex gap-2" },
          h(Button, {
            variant: "outline",
            size: "sm",
            onClick: handlePrint
          }, "Print"),
          h(Button, {
            variant: "outline",
            size: "sm",
            onClick: onClose
          }, "Close")
        )
      ),
      
      // Receipt Preview - Centered
      h('div', { className: "flex justify-center" },
        h('div', { 
          className: "bg-white border border-gray-300 p-4 font-mono text-xs leading-tight shadow-lg",
          style: { width: '80mm', minHeight: '200mm' }
        },
        h('div', { ref: receiptRef, className: "receipt" },
          // Header
          h('div', { className: "center bold large" }, "YOUR BUSINESS NAME"),
          h('div', { className: "center" }, "123 Business Street"),
          h('div', { className: "center" }, "City, State 12345"),
          h('div', { className: "center" }, "Phone: (555) 123-4567"),
          
          h('div', { className: "separator" }),
          
          // Order Info
          h('div', { className: "center bold" }, `ORDER #${orderData.id.slice(-8)}`),
          h('div', { className: "item-row" },
            h('span', null, "Date:"),
            h('span', null, dateStr)
          ),
          h('div', { className: "item-row" },
            h('span', null, "Time:"),
            h('span', null, timeStr)
          ),
          h('div', { className: "item-row" },
            h('span', null, "Cashier:"),
            h('span', null, orderData.cashier || "POS System")
          ),
          
          h('div', { className: "separator" }),
          
          // Customer Info
          orderData.customerInfo && orderData.customerInfo.name && h('div', null,
            h('div', { className: "bold" }, "CUSTOMER:"),
            h('div', null, orderData.customerInfo.name),
            orderData.customerInfo.phone && h('div', null, orderData.customerInfo.phone),
            orderData.customerInfo.email && h('div', null, orderData.customerInfo.email),
            h('div', { className: "separator" })
          ),
          
          // Items
          h('div', { className: "bold" }, "ITEMS:"),
          orderData.items.map((item, index) => 
            h('div', { key: index },
              h('div', { className: "item-row" },
                h('span', { className: "item-name" }, item.product_name || `Item ${index + 1}`),
                h('span', { className: "item-qty" }, `${item.quantity}x`),
                h('span', { className: "item-price" }, formatCurrency(item.unit_price))
              ),
              h('div', { className: "right" }, formatCurrency(item.quantity * item.unit_price))
            )
          ),
          
          h('div', { className: "separator" }),
          
          // Totals
          h('div', { className: "total-row" },
            h('span', { className: "total-label" }, "Subtotal:"),
            h('span', { className: "total-amount" }, formatCurrency(orderData.subtotal))
          ),
          h('div', { className: "total-row" },
            h('span', { className: "total-label" }, "Tax (10%):"),
            h('span', { className: "total-amount" }, formatCurrency(orderData.tax_amount))
          ),
          h('div', { className: "total-row bold large" },
            h('span', { className: "total-label" }, "TOTAL:"),
            h('span', { className: "total-amount" }, formatCurrency(orderData.total_amount))
          ),
          
          h('div', { className: "separator" }),
          
          // Payment Info
          h('div', { className: "total-row" },
            h('span', { className: "total-label" }, "Payment Method:"),
            h('span', { className: "total-amount" }, orderData.paymentMethod.toUpperCase())
          ),
          h('div', { className: "total-row" },
            h('span', { className: "total-label" }, "Amount Paid:"),
            h('span', { className: "total-amount" }, formatCurrency(orderData.total_amount))
          ),
          h('div', { className: "total-row" },
            h('span', { className: "total-label" }, "Change:"),
            h('span', { className: "total-amount" }, formatCurrency(0))
          ),
          
          h('div', { className: "separator" }),
          
          // Footer
          h('div', { className: "center" }, "Thank you for your business!"),
          h('div', { className: "center" }, "Please come again"),
          
          h('div', { className: "separator" }),
          
          h('div', { className: "center" }, "*** CUSTOMER COPY ***"),
          
          // Spacing for tear-off
          h('div', { style: { height: '20mm' } })
        )
        )
      )
    )
  );
};

export default ReceiptModal;
