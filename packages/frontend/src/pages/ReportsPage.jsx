import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import AppLayout from '../components/layout/AppLayout';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Toast from '../components/ui/Toast';
import { formatCurrency } from '../utils/currency';
import { useData } from '../contexts/DataContext';

const ReportsPage = () => {
  const { orders, products, loading, fetchOrders, fetchProducts } = useData();
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('sales');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // Get unique categories
  const categories = [...new Set(
    products
      .map(p => p.category)
      .filter(Boolean)
      .map(cat => cat.toLowerCase())
  )].sort();

  // Filter orders based on date range
  const getFilteredOrders = () => {
    const now = new Date();
    let filteredOrders = [...orders];

    // Date filtering
    if (dateRange === 'today') {
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= weekAgo;
      });
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= monthAgo;
      });
    } else if (dateRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= start && orderDate <= end;
      });
    }

    // Category filtering
    if (selectedCategory) {
      filteredOrders = filteredOrders.filter(order => {
        return order.items && order.items.some(item => {
          const product = products.find(p => p.id === item.product_id);
          return product && product.category.toLowerCase() === selectedCategory.toLowerCase();
        });
      });
    }

    return filteredOrders;
  };

  const filteredOrders = getFilteredOrders();

  // Calculate report data
  const calculateReportData = () => {
    const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = filteredOrders.length;
    const totalTax = filteredOrders.reduce((sum, order) => sum + (order.tax_amount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Payment method breakdown
    const paymentMethods = {};
    filteredOrders.forEach(order => {
      const method = order.payment_method || 'unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + (order.total_amount || 0);
    });

    // Product analysis
    const productSales = {};
    filteredOrders.forEach(order => {
      const orderItems = order.order_items || order.items || [];
      if (orderItems.length > 0) {
        orderItems.forEach(item => {
          // Handle both direct product data and product_id reference
          const product = item.products || products.find(p => p.id === item.product_id);
          const productName = product ? product.name : item.product_name || `Product ${item.product_id}`;
          const productCategory = product ? product.category : 'Unknown';
          
          if (!productSales[productName]) {
            productSales[productName] = { 
              quantity: 0, 
              revenue: 0, 
              category: productCategory,
              product: product 
            };
          }
          productSales[productName].quantity += item.quantity;
          productSales[productName].revenue += item.quantity * item.unit_price;
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);

    // Customer analysis
    const customerData = {};
    filteredOrders.forEach(order => {
      const customerName = order.customer_name || 'Walk-in Customer';
      if (!customerData[customerName]) {
        customerData[customerName] = {
          orders: 0,
          totalSpent: 0,
          email: order.customer_email,
          phone: order.customer_phone
        };
      }
      customerData[customerName].orders += 1;
      customerData[customerName].totalSpent += order.total_amount || 0;
    });

    const topCustomers = Object.entries(customerData)
      .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
      .slice(0, 10);

    // Category analysis
    const categoryData = {};
    Object.values(productSales).forEach(product => {
      const category = product.category || 'Unknown';
      if (!categoryData[category]) {
        categoryData[category] = { quantity: 0, revenue: 0 };
      }
      categoryData[category].quantity += product.quantity;
      categoryData[category].revenue += product.revenue;
    });

    // Daily sales (for charts)
    const dailySales = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.created_at).toDateString();
      dailySales[date] = (dailySales[date] || 0) + (order.total_amount || 0);
    });

    return {
      totalSales,
      totalOrders,
      totalTax,
      averageOrderValue,
      paymentMethods,
      topProducts,
      topCustomers,
      categoryData,
      productSales,
      dailySales
    };
  };

  const reportData = calculateReportData();

  const handlePrintReport = () => {
    let reportContent = '';
    
    if (reportType === 'sales') {
      reportContent = `
        <div class="section">
          <div class="section-title">All Sales</div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Status</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => {
                const orderDate = new Date(order.created_at);
                const dateStr = orderDate.toLocaleDateString();
                const timeStr = orderDate.toLocaleTimeString();
                return `
                  <tr>
                    <td>#${order.id.slice(-8)}</td>
                    <td>${order.customer_name || 'Walk-in Customer'}</td>
                    <td>${dateStr} ${timeStr}</td>
                    <td>${(order.payment_method || 'Unknown').charAt(0).toUpperCase() + (order.payment_method || 'Unknown').slice(1)}</td>
                    <td>${(order.status || 'completed').charAt(0).toUpperCase() + (order.status || 'completed').slice(1)}</td>
                    <td class="text-right">${formatCurrency(order.total_amount || 0)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (reportType === 'products') {
      reportContent = `
        <div class="section">
          <div class="section-title">Product Performance</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th class="text-right">Quantity Sold</th>
                <th class="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.topProducts.map(([product, data]) => `
                <tr>
                  <td>${product}</td>
                  <td>${(data.category || 'Unknown').charAt(0).toUpperCase() + (data.category || 'Unknown').slice(1)}</td>
                  <td class="text-right">${data.quantity}</td>
                  <td class="text-right">${formatCurrency(data.revenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Category Performance</div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th class="text-right">Quantity Sold</th>
                <th class="text-right">Revenue</th>
                <th class="text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(reportData.categoryData)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .map(([category, data]) => `
                  <tr>
                    <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
                    <td class="text-right">${data.quantity}</td>
                    <td class="text-right">${formatCurrency(data.revenue)}</td>
                    <td class="text-right">${((data.revenue / reportData.totalSales) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (reportType === 'customers') {
      reportContent = `
        <div class="section">
          <div class="section-title">Top Customers</div>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th class="text-right">Orders</th>
                <th class="text-right">Total Spent</th>
                <th class="text-right">Avg Order Value</th>
                <th class="text-right">% of Total Sales</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.topCustomers.map(([customer, data]) => `
                <tr>
                  <td>${customer}</td>
                  <td class="text-right">${data.orders}</td>
                  <td class="text-right">${formatCurrency(data.totalSpent)}</td>
                  <td class="text-right">${formatCurrency(data.totalSpent / data.orders)}</td>
                  <td class="text-right">${((data.totalSpent / reportData.totalSales) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .report-title {
              font-size: 18px;
              color: #666;
            }
            .report-info {
              margin-bottom: 30px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .summary-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 20px;
              font-weight: bold;
              color: #333;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 15px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">YOUR BUSINESS NAME</div>
            <div class="report-title">${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</div>
          </div>

          <div class="report-info">
            <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</p>
            <p><strong>Date Range:</strong> ${dateRange === 'custom' ? `${startDate} to ${endDate}` : dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            ${selectedCategory ? `<p><strong>Category Filter:</strong> ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</p>` : ''}
            <p><strong>Total Records:</strong> ${reportType === 'sales' ? filteredOrders.length : reportType === 'products' ? reportData.topProducts.length : reportData.topCustomers.length}</p>
          </div>

          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">Total Sales</div>
              <div class="summary-value">${formatCurrency(reportData.totalSales)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Orders</div>
              <div class="summary-value">${reportData.totalOrders}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Average Order</div>
              <div class="summary-value">${formatCurrency(reportData.averageOrderValue)}</div>
            </div>
          </div>

          ${reportContent}

          <div class="footer">
            <p>Report generated by POS System on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 100);

    setToast({ isOpen: true, message: 'Report sent to printer!', type: 'success' });
  };

  const MobileReportsLayout = () => (
    h('div', { className: "flex flex-col bg-gray-50 h-[calc(100vh-4rem)]" },
      // Report Type Tabs
      h('div', { className: "bg-white border-b border-gray-200" },
        h('div', { className: "flex overflow-x-auto" },
          h('button', {
            onClick: () => setReportType('sales'),
            className: `flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
              reportType === 'sales'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`
          }, "Sales"),
          h('button', {
            onClick: () => setReportType('products'),
            className: `flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
              reportType === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`
          }, "Products"),
          h('button', {
            onClick: () => setReportType('customers'),
            className: `flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
              reportType === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`
          }, "Customers")
        )
      ),

      // Filters
      h('div', { className: "bg-white border-b border-gray-200 p-4 space-y-4" },
        
        h('select', {
          value: dateRange,
          onChange: (e) => setDateRange(e.target.value),
          className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        },
          h('option', { value: "today" }, "Today"),
          h('option', { value: "week" }, "This Week"),
          h('option', { value: "month" }, "This Month"),
          h('option', { value: "custom" }, "Custom Range")
        ),

        dateRange === 'custom' && h('div', { className: "grid grid-cols-2 gap-2" },
          h(Input, {
            type: "date",
            value: startDate,
            onChange: (e) => setStartDate(e.target.value),
            fullWidth: true
          }),
          h(Input, {
            type: "date",
            value: endDate,
            onChange: (e) => setEndDate(e.target.value),
            fullWidth: true
          })
        ),

        h('select', {
          value: selectedCategory,
          onChange: (e) => setSelectedCategory(e.target.value),
          className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        },
          h('option', { value: "" }, "All Categories"),
          categories.map(category => 
            h('option', { key: category, value: category }, 
              category.charAt(0).toUpperCase() + category.slice(1)
            )
          )
        ),

        h(Button, {
          onClick: handlePrintReport,
          fullWidth: true
        }, "🖨️ Print Report")
      ),

      // Report Content
      h('div', { className: "flex-1 overflow-y-auto p-4 space-y-4" },
        // Summary Cards
        reportType === 'sales' && h('div', { className: "grid grid-cols-3 gap-4" },
          h(Card, { className: "p-4 text-center" },
            h('div', { className: "text-2xl font-bold text-blue-600" }, formatCurrency(reportData.totalSales)),
            h('div', { className: "text-sm text-gray-600" }, "Total Sales")
          ),
          h(Card, { className: "p-4 text-center" },
            h('div', { className: "text-2xl font-bold text-green-600" }, reportData.totalOrders),
            h('div', { className: "text-sm text-gray-600" }, "Total Orders")
          ),
          h(Card, { className: "p-4 text-center" },
            h('div', { className: "text-2xl font-bold text-purple-600" }, formatCurrency(reportData.averageOrderValue)),
            h('div', { className: "text-sm text-gray-600" }, "Avg Order")
          )
        ),

        // Sales Report Content
        reportType === 'sales' && h('div', { className: "space-y-4" },
          h(Card, { className: "p-4" },
            h('h3', { className: "font-semibold text-gray-900 mb-3" }, "All Sales"),
            h('div', { className: "space-y-2 max-h-96 overflow-y-auto" },
              filteredOrders.length > 0 ? 
                filteredOrders.map(order => {
                  const orderDate = new Date(order.created_at);
                  const dateStr = orderDate.toLocaleDateString();
                  const timeStr = orderDate.toLocaleTimeString();
                  
                  return h('div', { key: order.id, className: "border border-gray-200 rounded-lg p-3" },
                    h('div', { className: "flex justify-between items-start mb-2" },
                      h('div', null,
                        h('div', { className: "font-medium" }, `Order #${order.id.slice(-8)}`),
                        h('div', { className: "text-sm text-gray-600" }, `${dateStr} ${timeStr}`)
                      ),
                      h('div', { className: "text-right" },
                        h('div', { className: "font-semibold" }, formatCurrency(order.total_amount || 0)),
                        h('span', { 
                          className: `text-xs px-2 py-1 rounded ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`
                        }, order.status || 'completed')
                      )
                    ),
                    h('div', { className: "text-sm text-gray-600" },
                      h('div', null, `Customer: ${order.customer_name || 'Walk-in Customer'}`),
                      h('div', null, `Payment: ${order.payment_method || 'Unknown'}`)
                    )
                  );
                }) :
                h('div', { className: "text-center py-8 text-gray-500" }, "No sales found for the selected period")
            )
          )
        ),

        // Product Report Content
        reportType === 'products' && h('div', { className: "space-y-4" },
          h('div', { className: "grid grid-cols-2 gap-4" },
            h(Card, { className: "p-4 text-center" },
              h('div', { className: "text-2xl font-bold text-blue-600" }, reportData.topProducts.length),
              h('div', { className: "text-sm text-gray-600" }, "Products Sold")
            ),
            h(Card, { className: "p-4 text-center" },
              h('div', { className: "text-2xl font-bold text-green-600" }, 
                reportData.topProducts.reduce((sum, [, data]) => sum + data.quantity, 0)
              ),
              h('div', { className: "text-sm text-gray-600" }, "Total Quantity")
            )
          ),
          h(Card, { className: "p-4" },
            h('h3', { className: "font-semibold text-gray-900 mb-3" }, "Product Performance"),
            h('div', { className: "space-y-2" },
              reportData.topProducts.map(([product, data]) =>
                h('div', { key: product, className: "flex justify-between items-center py-2 border-b border-gray-100" },
                  h('div', null,
                    h('div', { className: "font-medium" }, product),
                    h('div', { className: "text-sm text-gray-600" }, `Category: ${data.category || 'Unknown'}`)
                  ),
                  h('div', { className: "text-right" },
                    h('div', { className: "font-medium" }, formatCurrency(data.revenue)),
                    h('div', { className: "text-sm text-gray-600" }, `${data.quantity} sold`)
                  )
                )
              )
            )
          ),
          h(Card, { className: "p-4" },
            h('h3', { className: "font-semibold text-gray-900 mb-3" }, "Category Performance"),
            h('div', { className: "space-y-2" },
              Object.entries(reportData.categoryData).map(([category, data]) =>
                h('div', { key: category, className: "flex justify-between items-center" },
                  h('span', { className: "capitalize" }, category),
                  h('div', { className: "text-right" },
                    h('div', { className: "font-medium" }, formatCurrency(data.revenue)),
                    h('div', { className: "text-sm text-gray-600" }, `${data.quantity} sold`)
                  )
                )
              )
            )
          )
        ),

        // Customer Report Content
        reportType === 'customers' && h('div', { className: "space-y-4" },
          h('div', { className: "grid grid-cols-2 gap-4" },
            h(Card, { className: "p-4 text-center" },
              h('div', { className: "text-2xl font-bold text-blue-600" }, reportData.topCustomers.length),
              h('div', { className: "text-sm text-gray-600" }, "Total Customers")
            ),
            h(Card, { className: "p-4 text-center" },
              h('div', { className: "text-2xl font-bold text-green-600" }, 
                reportData.topCustomers.length > 0 ? 
                  formatCurrency(reportData.topCustomers.reduce((sum, [, data]) => sum + data.totalSpent, 0) / reportData.topCustomers.length) :
                  formatCurrency(0)
              ),
              h('div', { className: "text-sm text-gray-600" }, "Avg Customer Value")
            )
          ),
          h(Card, { className: "p-4" },
            h('h3', { className: "font-semibold text-gray-900 mb-3" }, "Top Customers"),
            h('div', { className: "space-y-2" },
              reportData.topCustomers.map(([customer, data]) =>
                h('div', { key: customer, className: "flex justify-between items-center py-2 border-b border-gray-100" },
                  h('div', null,
                    h('div', { className: "font-medium" }, customer),
                    h('div', { className: "text-sm text-gray-600" }, 
                      `${data.orders} order${data.orders !== 1 ? 's' : ''}`
                    )
                  ),
                  h('div', { className: "text-right" },
                    h('div', { className: "font-medium" }, formatCurrency(data.totalSpent)),
                    h('div', { className: "text-sm text-gray-600" }, 
                      `Avg: ${formatCurrency(data.totalSpent / data.orders)}`
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );

  const DesktopReportsLayout = () => (
    h('div', { className: "flex flex-col bg-gray-50 h-[calc(100vh-4rem)]" },
      // Report Type Tabs
      h('div', { className: "bg-white border-b border-gray-200" },
        h('div', { className: "flex space-x-8 px-6" },
          h('button', {
            onClick: () => setReportType('sales'),
            className: `py-4 px-1 border-b-2 font-medium text-sm ${
              reportType === 'sales'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }, "Sales Report"),
          h('button', {
            onClick: () => setReportType('products'),
            className: `py-4 px-1 border-b-2 font-medium text-sm ${
              reportType === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }, "Product Report"),
          h('button', {
            onClick: () => setReportType('customers'),
            className: `py-4 px-1 border-b-2 font-medium text-sm ${
              reportType === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }, "Customer Report")
        )
      ),

      // Filters
      h('div', { className: "bg-white border-b border-gray-200 p-6" },
        h('div', { className: "flex gap-4 items-center flex-wrap" },
          
          h('select', {
            value: dateRange,
            onChange: (e) => setDateRange(e.target.value),
            className: "border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          },
            h('option', { value: "today" }, "Today"),
            h('option', { value: "week" }, "This Week"),
            h('option', { value: "month" }, "This Month"),
            h('option', { value: "custom" }, "Custom Range")
          ),

          dateRange === 'custom' && h('div', { className: "flex gap-2" },
            h(Input, {
              type: "date",
              value: startDate,
              onChange: (e) => setStartDate(e.target.value)
            }),
            h(Input, {
              type: "date",
              value: endDate,
              onChange: (e) => setEndDate(e.target.value)
            })
          ),

          h('select', {
            value: selectedCategory,
            onChange: (e) => setSelectedCategory(e.target.value),
            className: "border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          },
            h('option', { value: "" }, "All Categories"),
            categories.map(category => 
              h('option', { key: category, value: category }, 
                category.charAt(0).toUpperCase() + category.slice(1)
              )
            )
          ),

          h(Button, {
            onClick: handlePrintReport
          }, "🖨️ Print Report")
        )
      ),

      // Report Content
      h('div', { className: "flex-1 overflow-y-auto p-6" },
        h('div', { className: "space-y-6" },
          // Sales Report
          reportType === 'sales' && h('div', { className: "space-y-6" },
            // Summary Cards
            h('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-blue-600 mb-2" }, formatCurrency(reportData.totalSales)),
                h('div', { className: "text-gray-600" }, "Total Sales")
              ),
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-green-600 mb-2" }, reportData.totalOrders),
                h('div', { className: "text-gray-600" }, "Total Orders")
              ),
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-purple-600 mb-2" }, formatCurrency(reportData.averageOrderValue)),
                h('div', { className: "text-gray-600" }, "Average Order Value")
              )
            ),

            // All Sales List
            h(Card, { className: "p-6" },
              h('h3', { className: "text-lg font-semibold text-gray-900 mb-4" }, "All Sales"),
              h('div', { className: "overflow-x-auto" },
                h('table', { className: "w-full text-sm" },
                  h('thead', { className: "border-b border-gray-200" },
                    h('tr', null,
                      h('th', { className: "text-left py-2 font-medium text-gray-600" }, "Order ID"),
                      h('th', { className: "text-left py-2 font-medium text-gray-600" }, "Customer"),
                      h('th', { className: "text-left py-2 font-medium text-gray-600" }, "Date"),
                      h('th', { className: "text-left py-2 font-medium text-gray-600" }, "Payment"),
                      h('th', { className: "text-center py-2 font-medium text-gray-600" }, "Status"),
                      h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Total")
                    )
                  ),
                  h('tbody', null,
                    filteredOrders.length > 0 ? 
                      filteredOrders.map(order => {
                        const orderDate = new Date(order.created_at);
                        const dateStr = orderDate.toLocaleDateString();
                        const timeStr = orderDate.toLocaleTimeString();
                        
                        return h('tr', { key: order.id, className: "border-b border-gray-100 hover:bg-gray-50" },
                          h('td', { className: "py-3 font-medium" }, `#${order.id.slice(-8)}`),
                          h('td', { className: "py-3" }, order.customer_name || 'Walk-in Customer'),
                          h('td', { className: "py-3" }, 
                            h('div', null,
                              h('div', null, dateStr),
                              h('div', { className: "text-xs text-gray-500" }, timeStr)
                            )
                          ),
                          h('td', { className: "py-3 capitalize" }, order.payment_method || 'Unknown'),
                          h('td', { className: "py-3 text-center" },
                            h('span', { 
                              className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`
                            }, order.status || 'completed')
                          ),
                          h('td', { className: "py-3 text-right font-semibold" }, formatCurrency(order.total_amount || 0))
                        );
                      }) :
                      h('tr', null,
                        h('td', { colSpan: 6, className: "py-8 text-center text-gray-500" }, 
                          "No sales found for the selected period"
                        )
                      )
                  )
                )
              )
            )
          ),

          // Product Report
          reportType === 'products' && h('div', { className: "space-y-6" },
            h('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" },
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-blue-600 mb-2" }, reportData.topProducts.length),
                h('div', { className: "text-gray-600" }, "Products Sold")
              ),
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-green-600 mb-2" }, 
                  reportData.topProducts.reduce((sum, [, data]) => sum + data.quantity, 0)
                ),
                h('div', { className: "text-gray-600" }, "Total Quantity Sold")
              ),
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-purple-600 mb-2" }, 
                  Object.keys(reportData.categoryData).length
                ),
                h('div', { className: "text-gray-600" }, "Categories")
              ),
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-orange-600 mb-2" }, formatCurrency(reportData.totalSales)),
                h('div', { className: "text-gray-600" }, "Total Revenue")
              )
            ),

            h('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
              h(Card, { className: "p-6" },
                h('h3', { className: "text-lg font-semibold text-gray-900 mb-4" }, "Product Performance"),
                h('div', { className: "overflow-x-auto" },
                  h('table', { className: "w-full text-sm" },
                    h('thead', { className: "border-b border-gray-200" },
                      h('tr', null,
                        h('th', { className: "text-left py-2 font-medium text-gray-600" }, "Product"),
                        h('th', { className: "text-left py-2 font-medium text-gray-600" }, "Category"),
                        h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Qty Sold"),
                        h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Revenue")
                      )
                    ),
                    h('tbody', null,
                      reportData.topProducts.map(([product, data]) =>
                        h('tr', { key: product, className: "border-b border-gray-100" },
                          h('td', { className: "py-3" }, product),
                          h('td', { className: "py-3 capitalize" }, data.category || 'Unknown'),
                          h('td', { className: "py-3 text-right" }, data.quantity),
                          h('td', { className: "py-3 text-right font-medium" }, formatCurrency(data.revenue))
                        )
                      )
                    )
                  )
                )
              ),

              h(Card, { className: "p-6" },
                h('h3', { className: "text-lg font-semibold text-gray-900 mb-4" }, "Category Performance"),
                h('div', { className: "overflow-x-auto" },
                  h('table', { className: "w-full text-sm" },
                    h('thead', { className: "border-b border-gray-200" },
                      h('tr', null,
                        h('th', { className: "text-left py-2 font-medium text-gray-600" }, "Category"),
                        h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Qty Sold"),
                        h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Revenue"),
                        h('th', { className: "text-right py-2 font-medium text-gray-600" }, "% of Total")
                      )
                    ),
                    h('tbody', null,
                      Object.entries(reportData.categoryData)
                        .sort((a, b) => b[1].revenue - a[1].revenue)
                        .map(([category, data]) =>
                          h('tr', { key: category, className: "border-b border-gray-100" },
                            h('td', { className: "py-3 capitalize" }, category),
                            h('td', { className: "py-3 text-right" }, data.quantity),
                            h('td', { className: "py-3 text-right font-medium" }, formatCurrency(data.revenue)),
                            h('td', { className: "py-3 text-right" }, 
                              `${((data.revenue / reportData.totalSales) * 100).toFixed(1)}%`
                            )
                          )
                        )
                    )
                  )
                )
              )
            )
          ),

          // Customer Report
          reportType === 'customers' && h('div', { className: "space-y-6" },
            h('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" },
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-blue-600 mb-2" }, reportData.topCustomers.length),
                h('div', { className: "text-gray-600" }, "Total Customers")
              ),
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-green-600 mb-2" }, 
                  reportData.topCustomers.length > 0 ? 
                    formatCurrency(reportData.topCustomers.reduce((sum, [, data]) => sum + data.totalSpent, 0) / reportData.topCustomers.length) :
                    formatCurrency(0)
                ),
                h('div', { className: "text-gray-600" }, "Average Customer Value")
              ),
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-purple-600 mb-2" }, 
                  reportData.topCustomers.reduce((sum, [, data]) => sum + data.orders, 0)
                ),
                h('div', { className: "text-gray-600" }, "Total Orders")
              ),
              h(Card, { className: "p-6 text-center" },
                h('div', { className: "text-3xl font-bold text-orange-600 mb-2" }, 
                  reportData.topCustomers.length > 0 ? 
                    (reportData.topCustomers.reduce((sum, [, data]) => sum + data.orders, 0) / reportData.topCustomers.length).toFixed(1) :
                    '0'
                ),
                h('div', { className: "text-gray-600" }, "Avg Orders per Customer")
              )
            ),

            h('div', { className: "grid grid-cols-1 gap-6" },
              h(Card, { className: "p-6" },
                h('h3', { className: "text-lg font-semibold text-gray-900 mb-4" }, "Top Customers"),
                h('div', { className: "overflow-x-auto" },
                  h('table', { className: "w-full text-sm" },
                    h('thead', { className: "border-b border-gray-200" },
                      h('tr', null,
                        h('th', { className: "text-left py-2 font-medium text-gray-600" }, "Customer"),
                        h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Orders"),
                        h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Total Spent"),
                        h('th', { className: "text-right py-2 font-medium text-gray-600" }, "Avg Order Value"),
                        h('th', { className: "text-right py-2 font-medium text-gray-600" }, "% of Total Sales")
                      )
                    ),
                    h('tbody', null,
                      reportData.topCustomers.map(([customer, data]) =>
                        h('tr', { key: customer, className: "border-b border-gray-100" },
                          h('td', { className: "py-3" }, customer),
                          h('td', { className: "py-3 text-right" }, data.orders),
                          h('td', { className: "py-3 text-right font-medium" }, formatCurrency(data.totalSpent)),
                          h('td', { className: "py-3 text-right" }, formatCurrency(data.totalSpent / data.orders)),
                          h('td', { className: "py-3 text-right" }, 
                            `${((data.totalSpent / reportData.totalSales) * 100).toFixed(1)}%`
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );

  return h('div', null,
    h(AppLayout, { currentPath: "/reports" },
      h(ResponsiveLayout, {
        mobileComponent: h(MobileReportsLayout),
        desktopComponent: h(DesktopReportsLayout)
      })
    ),

    h(Toast, {
      isOpen: toast.isOpen,
      onClose: () => setToast({ ...toast, isOpen: false }),
      message: toast.message,
      type: toast.type
    })
  );
};

export default ReportsPage;
