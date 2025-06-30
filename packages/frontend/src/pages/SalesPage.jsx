import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import AppLayout from '../components/layout/AppLayout';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { formatCurrency } from '../utils/currency';
import { useData } from '../contexts/DataContext';

const SalesDetailsModal = ({ isOpen, onClose, order, onPrintReceipt }) => {
  if (!order) return null;

  const orderDate = new Date(order.created_at);
  const dateStr = orderDate.toLocaleDateString();
  const timeStr = orderDate.toLocaleTimeString();

  return h(Modal, { open: isOpen, onClose: onClose, size: "lg" },
    h('div', { className: "p-6" },
      h('div', { className: "flex items-center justify-between mb-6" },
        h('h2', { className: "text-xl font-semibold text-gray-900" }, 
          `Order #${order.id.slice(-8)}`
        ),
        h('div', { className: "flex gap-2" },
          h(Button, {
            variant: "outline",
            size: "sm",
            onClick: () => onPrintReceipt(order)
          }, "🖨️ Print Receipt"),
          h(Button, {
            variant: "outline",
            size: "sm",
            onClick: onClose
          }, "Close")
        )
      ),

      h('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" },
        // Order Information
        h(Card, { className: "p-4" },
          h('h3', { className: "font-semibold text-gray-900 mb-3" }, "Order Information"),
          h('div', { className: "space-y-2 text-sm" },
            h('div', { className: "flex justify-between" },
              h('span', { className: "text-gray-600" }, "Date:"),
              h('span', { className: "font-medium" }, dateStr)
            ),
            h('div', { className: "flex justify-between" },
              h('span', { className: "text-gray-600" }, "Time:"),
              h('span', { className: "font-medium" }, timeStr)
            ),
            h('div', { className: "flex justify-between" },
              h('span', { className: "text-gray-600" }, "Payment Method:"),
              h('span', { className: "font-medium capitalize" }, order.payment_method)
            ),
            h('div', { className: "flex justify-between" },
              h('span', { className: "text-gray-600" }, "Status:"),
              h('span', { 
                className: `font-medium px-2 py-1 rounded text-xs ${
                  order.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`
              }, order.status || 'completed')
            )
          )
        ),

        // Customer Information
        h(Card, { className: "p-4" },
          h('h3', { className: "font-semibold text-gray-900 mb-3" }, "Customer Information"),
          h('div', { className: "space-y-2 text-sm" },
            h('div', { className: "flex justify-between" },
              h('span', { className: "text-gray-600" }, "Name:"),
              h('span', { className: "font-medium" }, order.customer_name || 'Walk-in Customer')
            ),
            order.customer_email && h('div', { className: "flex justify-between" },
              h('span', { className: "text-gray-600" }, "Email:"),
              h('span', { className: "font-medium" }, order.customer_email)
            ),
            order.customer_phone && h('div', { className: "flex justify-between" },
              h('span', { className: "text-gray-600" }, "Phone:"),
              h('span', { className: "font-medium" }, order.customer_phone)
            )
          )
        )
      ),

      // Order Items
      h(Card, { className: "p-4 mb-6" },
        h('h3', { className: "font-semibold text-gray-900 mb-4" }, "Order Items"),
        h('div', { className: "overflow-x-auto" },
          h('table', { className: "w-full text-sm" },
            h('thead', { className: "border-b border-gray-200" },
              h('tr', null,
                h('th', { className: "text-left py-2 font-medium text-gray-600" }, "Product"),
                h('th', { className: "text-center py-2 font-medium text-gray-600" }, "Qty"),
                h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Unit Price"),
                h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Total")
              )
            ),
            h('tbody', null,
              (order.order_items || order.items || []).map((item, index) => {
                // Handle both backend format (order_items with nested products) and frontend format (items)
                const productName = item.products?.name || item.product_name || `Item ${index + 1}`;
                const quantity = item.quantity || 0;
                const unitPrice = item.unit_price || 0;
                
                return h('tr', { key: index, className: "border-b border-gray-100" },
                  h('td', { className: "py-3" }, productName),
                  h('td', { className: "py-3 text-center" }, quantity),
                  h('td', { className: "py-3 text-right" }, formatCurrency(unitPrice)),
                  h('td', { className: "py-3 text-right font-medium" }, 
                    formatCurrency(quantity * unitPrice)
                  )
                );
              })
            )
          )
        )
      ),

      // Order Summary
      h(Card, { className: "p-4" },
        h('h3', { className: "font-semibold text-gray-900 mb-4" }, "Order Summary"),
        h('div', { className: "space-y-2" },
          h('div', { className: "flex justify-between text-sm" },
            h('span', { className: "text-gray-600" }, "Subtotal:"),
            h('span', { className: "font-medium" }, 
              formatCurrency((order.total_amount || 0) - (order.tax_amount || 0))
            )
          ),
          h('div', { className: "flex justify-between text-sm" },
            h('span', { className: "text-gray-600" }, "Tax:"),
            h('span', { className: "font-medium" }, formatCurrency(order.tax_amount || 0))
          ),
          order.discount_amount > 0 && h('div', { className: "flex justify-between text-sm" },
            h('span', { className: "text-gray-600" }, "Discount:"),
            h('span', { className: "font-medium text-green-600" }, 
              `-${formatCurrency(order.discount_amount)}`
            )
          ),
          h('div', { className: "border-t border-gray-200 pt-2 mt-2" },
            h('div', { className: "flex justify-between text-lg font-semibold" },
              h('span', null, "Total:"),
              h('span', null, formatCurrency(order.total_amount || 0))
            )
          )
        )
      )
    )
  );
};

const SalesCard = ({ order, onClick, onPrintReceipt }) => {
  const orderDate = new Date(order.created_at);
  const dateStr = orderDate.toLocaleDateString();
  const timeStr = orderDate.toLocaleTimeString();

  return h(Card, { 
    className: "p-4 cursor-pointer hover:shadow-md transition-shadow",
    onClick: () => onClick(order)
  },
    h('div', { className: "flex items-center justify-between mb-3" },
      h('h3', { className: "font-semibold text-gray-900" }, 
        `Order #${order.id.slice(-8)}`
      ),
      h('span', { 
        className: `px-2 py-1 rounded text-xs font-medium ${
          order.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`
      }, order.status || 'completed')
    ),

    h('div', { className: "space-y-2 text-sm text-gray-600 mb-4" },
      h('div', { className: "flex justify-between" },
        h('span', null, "Date:"),
        h('span', null, `${dateStr} ${timeStr}`)
      ),
      h('div', { className: "flex justify-between" },
        h('span', null, "Customer:"),
        h('span', null, order.customer_name || 'Walk-in Customer')
      ),
      h('div', { className: "flex justify-between" },
        h('span', null, "Payment:"),
        h('span', { className: "capitalize" }, order.payment_method)
      )
    ),

    h('div', { className: "flex items-center justify-between pt-3 border-t border-gray-200" },
      h('span', { className: "text-lg font-semibold text-gray-900" }, 
        formatCurrency(order.total_amount || 0)
      ),
      h('div', { className: "flex gap-2" },
        h(Button, {
          variant: "outline",
          size: "sm",
          onClick: (e) => {
            e.stopPropagation();
            onPrintReceipt(order);
          }
        }, "🖨️ Print"),
        h(Button, {
          variant: "outline",
          size: "sm",
          onClick: (e) => {
            e.stopPropagation();
            onClick(order);
          }
        }, "View Details")
      )
    )
  );
};

const MobileSalesLayout = ({ 
  orders, 
  loading, 
  searchTerm, 
  onSearchChange, 
  dateFilter, 
  onDateFilterChange,
  onOrderClick,
  onPrintReceipt
}) => {
  return h('div', { className: "flex flex-col bg-gray-50 h-[calc(100vh-4rem)]" },
    // Search and Filters
    h('div', { className: "bg-white border-b border-gray-200 p-4 space-y-4" },
      h(Input, {
        placeholder: "Search orders...",
        value: searchTerm,
        onChange: (e) => onSearchChange(e.target.value),
        fullWidth: true,
        leftIcon: h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
          h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
        )
      }),
      h('select', {
        value: dateFilter,
        onChange: (e) => onDateFilterChange(e.target.value),
        className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
      },
        h('option', { value: "all" }, "All Time"),
        h('option', { value: "today" }, "Today"),
        h('option', { value: "week" }, "This Week"),
        h('option', { value: "month" }, "This Month")
      )
    ),

    // Orders List
    h('div', { className: "flex-1 overflow-y-auto p-4" },
      loading.orders ? 
        h('div', { className: "space-y-4" },
          [...Array(6)].map((_, i) => 
            h('div', { key: i, className: "bg-gray-200 animate-pulse rounded-lg h-32" })
          )
        ) :
        orders.length > 0 ?
          h('div', { className: "space-y-4" },
            orders.map(order => 
              h(SalesCard, {
                key: order.id,
                order: order,
                onClick: onOrderClick,
                onPrintReceipt: onPrintReceipt
              })
            )
          ) :
          h('div', { className: "text-center py-12" },
            h('svg', { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" })
            ),
            h('h3', { className: "mt-2 text-sm font-medium text-gray-900" }, "No sales found"),
            h('p', { className: "mt-1 text-sm text-gray-500" }, "No orders match your search criteria.")
          )
    )
  );
};

const DesktopSalesLayout = ({ 
  orders, 
  loading, 
  searchTerm, 
  onSearchChange, 
  dateFilter, 
  onDateFilterChange,
  onOrderClick,
  onPrintReceipt,
  viewMode,
  onViewModeChange
}) => {
  return h('div', { className: "flex flex-col bg-gray-50 h-[calc(100vh-4rem)]" },
    // Search and Filters
    h('div', { className: "bg-white border-b border-gray-200 p-6" },
      h('div', { className: "flex gap-4 items-center" },
        h('div', { className: "flex-1" },
          h(Input, {
            placeholder: "Search orders by customer name, order ID...",
            value: searchTerm,
            onChange: (e) => onSearchChange(e.target.value),
            fullWidth: true,
            leftIcon: h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
            )
          })
        ),
        h('select', {
          value: dateFilter,
          onChange: (e) => onDateFilterChange(e.target.value),
          className: "border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        },
          h('option', { value: "all" }, "All Time"),
          h('option', { value: "today" }, "Today"),
          h('option', { value: "week" }, "This Week"),
          h('option', { value: "month" }, "This Month")
        ),
        // View Mode Toggle
        h('div', { className: "flex border border-gray-300 rounded-lg overflow-hidden" },
          h('button', {
            onClick: () => onViewModeChange('table'),
            className: `px-3 py-2 text-sm font-medium ${
              viewMode === 'table' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`
          }, "📋 Table"),
          h('button', {
            onClick: () => onViewModeChange('cards'),
            className: `px-3 py-2 text-sm font-medium ${
              viewMode === 'cards' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`
          }, "🗃️ Cards")
        )
      )
    ),

    // Orders Content
    h('div', { className: "flex-1 overflow-y-auto p-6" },
      loading.orders ? 
        viewMode === 'table' ?
          h('div', { className: "bg-white rounded-lg shadow" },
            h('div', { className: "animate-pulse" },
              h('div', { className: "h-12 bg-gray-200 rounded-t-lg" }),
              [...Array(8)].map((_, i) => 
                h('div', { key: i, className: "h-16 bg-gray-100 border-t border-gray-200" })
              )
            )
          ) :
          h('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
            [...Array(9)].map((_, i) => 
              h('div', { key: i, className: "bg-gray-200 animate-pulse rounded-lg h-48" })
            )
          ) :
        orders.length > 0 ?
          viewMode === 'table' ?
            h('div', { className: "bg-white rounded-lg shadow overflow-hidden" },
              h('div', { className: "overflow-x-auto" },
                h('table', { className: "w-full" },
                  h('thead', { className: "bg-gray-50 border-b border-gray-200" },
                    h('tr', null,
                      h('th', { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Order ID"),
                      h('th', { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Customer"),
                      h('th', { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Date"),
                      h('th', { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Payment"),
                      h('th', { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Status"),
                      h('th', { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Total"),
                      h('th', { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Actions")
                    )
                  ),
                  h('tbody', { className: "bg-white divide-y divide-gray-200" },
                    orders.map(order => {
                      const orderDate = new Date(order.created_at);
                      const dateStr = orderDate.toLocaleDateString();
                      const timeStr = orderDate.toLocaleTimeString();
                      
                      return h('tr', { 
                        key: order.id, 
                        className: "hover:bg-gray-50 cursor-pointer",
                        onClick: () => onOrderClick(order)
                      },
                        h('td', { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" }, 
                          `#${order.id.slice(-8)}`
                        ),
                        h('td', { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900" }, 
                          order.customer_name || 'Walk-in Customer'
                        ),
                        h('td', { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900" }, 
                          h('div', null,
                            h('div', null, dateStr),
                            h('div', { className: "text-xs text-gray-500" }, timeStr)
                          )
                        ),
                        h('td', { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize" }, 
                          order.payment_method
                        ),
                        h('td', { className: "px-6 py-4 whitespace-nowrap" },
                          h('span', { 
                            className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`
                          }, order.status || 'completed')
                        ),
                        h('td', { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right" }, 
                          formatCurrency(order.total_amount || 0)
                        ),
                        h('td', { className: "px-6 py-4 whitespace-nowrap text-center" },
                          h('div', { className: "flex justify-center gap-2" },
                            h(Button, {
                              variant: "outline",
                              size: "sm",
                              onClick: (e) => {
                                e.stopPropagation();
                                onPrintReceipt(order);
                              }
                            }, "Print"),
                            h(Button, {
                              variant: "outline",
                              size: "sm",
                              onClick: (e) => {
                                e.stopPropagation();
                                onOrderClick(order);
                              }
                            }, "View")
                          )
                        )
                      );
                    })
                  )
                )
              )
            ) :
            h('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
              orders.map(order => 
                h(SalesCard, {
                  key: order.id,
                  order: order,
                  onClick: onOrderClick,
                  onPrintReceipt: onPrintReceipt
                })
              )
            ) :
          h('div', { className: "text-center py-12" },
            h('svg', { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" })
            ),
            h('h3', { className: "mt-2 text-sm font-medium text-gray-900" }, "No sales found"),
            h('p', { className: "mt-1 text-sm text-gray-500" }, "No orders match your search criteria.")
          )
    )
  );
};

const SalesPage = () => {
  const { orders, loading, fetchOrders } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // Default to table for desktop
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search and date
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());

    const orderDate = new Date(order.created_at);
    const now = new Date();
    let matchesDate = true;

    if (dateFilter === 'today') {
      matchesDate = orderDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = orderDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      matchesDate = orderDate >= monthAgo;
    }

    return matchesSearch && matchesDate;
  });

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handlePrintReceipt = (order) => {
    // Create receipt data in the same format as POS
    const receiptData = {
      id: order.id,
      customerInfo: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone
      },
      paymentMethod: order.payment_method,
      items: order.items || [],
      subtotal: (order.total_amount || 0) - (order.tax_amount || 0),
      tax_amount: order.tax_amount || 0,
      total_amount: order.total_amount || 0
    };

    // Use the same print function as POS
    handleDirectPrint(receiptData);
    setToast({ isOpen: true, message: `Receipt for Order #${order.id.slice(-8)} sent to printer!`, type: 'success' });
  };

  const handleDirectPrint = (orderData) => {
    const currentDate = new Date(orderData.created_at || new Date());
    const dateStr = currentDate.toLocaleDateString();
    const timeStr = currentDate.toLocaleTimeString();

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
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 100);
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
  };

  return h('div', null,
    h(AppLayout, { currentPath: "/sales" },
      h(ResponsiveLayout, {
        mobileComponent: h(MobileSalesLayout, {
          orders: filteredOrders,
          loading: loading,
          searchTerm: searchTerm,
          onSearchChange: setSearchTerm,
          dateFilter: dateFilter,
          onDateFilterChange: setDateFilter,
          onOrderClick: handleOrderClick,
          onPrintReceipt: handlePrintReceipt
        }),
        desktopComponent: h(DesktopSalesLayout, {
          orders: filteredOrders,
          loading: loading,
          searchTerm: searchTerm,
          onSearchChange: setSearchTerm,
          dateFilter: dateFilter,
          onDateFilterChange: setDateFilter,
          onOrderClick: handleOrderClick,
          onPrintReceipt: handlePrintReceipt,
          viewMode: viewMode,
          onViewModeChange: setViewMode
        })
      })
    ),

    h(SalesDetailsModal, {
      isOpen: showOrderDetails,
      onClose: () => setShowOrderDetails(false),
      order: selectedOrder,
      onPrintReceipt: handlePrintReceipt
    }),

    h(Toast, {
      isOpen: toast.isOpen,
      onClose: () => setToast({ ...toast, isOpen: false }),
      message: toast.message,
      type: toast.type
    })
  );
};

export default SalesPage;
