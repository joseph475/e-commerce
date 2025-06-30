import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/ui/Toast';
import Grid from '../components/ui/Grid';
import { formatCurrency } from '../utils/currency';
import { useCache } from '../hooks/useCache';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const ProductForm = ({ isOpen, onClose, product, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    stock_type: 'tracked', // 'tracked', 'unlimited', 'recipe-based'
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        stock_quantity: product.stock_quantity || '',
        stock_type: product.stock_type || 'tracked',
        image: null
      });
      setImagePreview(product.image_url || null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '',
        stock_type: 'tracked',
        image: null
      });
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const stockTypeOptions = [
    { value: 'tracked', label: 'Track Inventory', description: 'Monitor exact quantities' },
    { value: 'unlimited', label: 'Unlimited Stock', description: 'Always available (e.g., services)' },
    // { value: 'recipe-based', label: 'Recipe Based', description: 'Calculate from ingredients' }
  ];

  return h(Modal, { open: isOpen, onClose: onClose, size: "lg" },
    h('div', { className: "p-6" },
      h('h2', { className: "text-xl font-semibold text-gray-900 mb-6" }, 
        product ? 'Edit Product' : 'Add New Product'
      ),
      
      h('form', { onSubmit: handleSubmit, className: "space-y-6" },
        // Basic Information
        h('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
          h(Input, {
            label: "Product Name",
            value: formData.name,
            onChange: (e) => handleInputChange('name', e.target.value),
            required: true,
            fullWidth: true
          }),
          
          h(Input, {
            label: "Category",
            value: formData.category,
            onChange: (e) => handleInputChange('category', e.target.value),
            required: true,
            fullWidth: true
          })
        ),
        
        h(Input, {
          label: "Description",
          value: formData.description,
          onChange: (e) => handleInputChange('description', e.target.value),
          fullWidth: true,
          multiline: true,
          rows: 3
        }),
        
        h(Input, {
          label: "Price",
          type: "number",
          step: "0.01",
          value: formData.price,
          onChange: (e) => handleInputChange('price', e.target.value),
          required: true,
          fullWidth: true
        }),
        
        // Stock Management
        h('div', { className: "space-y-4" },
          h('h3', { className: "text-lg font-medium text-gray-900" }, "Stock Management"),
          
          h('div', { className: "space-y-3" },
            stockTypeOptions.map(option => 
              h('label', { 
                key: option.value,
                className: `flex items-start space-x-3 p-3 border rounded-lg cursor-pointer ${
                  formData.stock_type === option.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`
              },
                h('input', {
                  type: "radio",
                  name: "stock_type",
                  value: option.value,
                  checked: formData.stock_type === option.value,
                  onChange: (e) => handleInputChange('stock_type', e.target.value),
                  className: "mt-1"
                }),
                h('div', null,
                  h('div', { className: "font-medium text-gray-900" }, option.label),
                  h('div', { className: "text-sm text-gray-500" }, option.description)
                )
              )
            )
          ),
          
          formData.stock_type === 'tracked' && h(Input, {
            label: "Initial Stock Quantity",
            type: "number",
            value: formData.stock_quantity,
            onChange: (e) => handleInputChange('stock_quantity', e.target.value),
            fullWidth: true
          })
        ),
        
        // Image Upload
        h('div', { className: "space-y-4" },
          h('h3', { className: "text-lg font-medium text-gray-900" }, "Product Image"),
          
          h('div', { className: "flex items-start space-x-4" },
            imagePreview && h('div', { className: "flex-shrink-0" },
              h('img', {
                src: imagePreview,
                alt: "Preview",
                className: "w-24 h-24 object-cover rounded-lg border border-gray-200"
              })
            ),
            
            h('div', { className: "flex-1" },
              h('input', {
                type: "file",
                accept: "image/*",
                onChange: handleImageChange,
                className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              }),
              h('p', { className: "text-sm text-gray-500 mt-2" }, 
                "Upload a product image (JPG, PNG, GIF, WebP - Max 5MB)"
              )
            )
          )
        ),
        
        // Actions
        h('div', { className: "flex gap-3 pt-4 border-t border-gray-200" },
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
          }, product ? 'Update Product' : 'Create Product')
        )
      )
    )
  );
};

const StockUpdateModal = ({ isOpen, onClose, product, onSubmit, loading }) => {
  const [operation, setOperation] = useState('add');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(product.id, { operation, stock_quantity: quantity });
  };

  if (!product) return null;

  return h(Modal, { open: isOpen, onClose: onClose, size: "sm" },
    h('div', { className: "p-6" },
      h('h2', { className: "text-xl font-semibold text-gray-900 mb-4" }, 
        `Update Stock: ${product.name}`
      ),
      
      h('div', { className: "mb-4 p-3 bg-gray-50 rounded-lg" },
        h('p', { className: "text-sm text-gray-600" }, "Current Stock"),
        h('p', { className: "text-lg font-semibold text-gray-900" }, 
          product.stock_type === 'unlimited' ? 'Unlimited' : product.stock_quantity || 0
        )
      ),
      
      product.stock_type !== 'unlimited' && h('form', { onSubmit: handleSubmit, className: "space-y-4" },
        h('div', null,
          h('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Operation"),
          h('select', {
            value: operation,
            onChange: (e) => setOperation(e.target.value),
            className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          },
            h('option', { value: "add" }, "Add Stock"),
            h('option', { value: "subtract" }, "Remove Stock"),
            h('option', { value: "set" }, "Set Exact Amount")
          )
        ),
        
        h(Input, {
          label: "Quantity",
          type: "number",
          value: quantity,
          onChange: (e) => setQuantity(e.target.value),
          required: true,
          fullWidth: true
        }),
        
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
          }, "Update Stock")
        )
      )
    )
  );
};

const ProductCard = ({ product, onEdit, onUpdateStock, onDelete }) => {
  const getStockStatus = () => {
    if (product.stock_type === 'unlimited') {
      return { text: 'Unlimited', color: 'text-green-200 bg-green-500/80' };
    }
    
    if (product.stock_type === 'recipe-based') {
      return { text: 'Recipe Based', color: 'text-purple-200 bg-purple-500/80' };
    }
    
    const stock = product.stock_quantity || 0;
    if (stock === 0) {
      return { text: 'Out of Stock', color: 'text-red-200 bg-red-500/80' };
    } else if (stock <= 5) {
      return { text: `${stock} (Low)`, color: 'text-orange-200 bg-orange-500/80' };
    } else {
      return { text: stock.toString(), color: 'text-green-200 bg-green-500/80' };
    }
  };

  const stockStatus = getStockStatus();

  return h(Card, { 
    className: "h-full",
    padding: "none",
    hover: true
  },
    h('div', { className: "aspect-square relative overflow-hidden rounded-lg" },
      product.image_url ? 
        h('img', {
          src: product.image_url,
          alt: product.name,
          className: "w-full h-full object-cover"
        }) :
        h('div', { className: "w-full h-full flex items-center justify-center bg-gray-100 text-gray-400" },
          h('svg', { className: "w-12 h-12", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })
          )
        ),
      
      // Overlay with product info and actions
      h('div', { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" },
        // Top right action icons
        h('div', { className: "absolute top-2 right-2 flex gap-1" },
          h('button', {
            onClick: (e) => {
              e.stopPropagation();
              onEdit(product);
            },
            className: "p-1.5 bg-white/60 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white/80 transition-colors"
          },
            h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" })
            )
          ),
          product.stock_type === 'tracked' && h('button', {
            onClick: (e) => {
              e.stopPropagation();
              onUpdateStock(product);
            },
            className: "p-1.5 bg-blue-500/60 backdrop-blur-sm rounded-full text-white hover:bg-blue-500/80 transition-colors"
          },
            h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" })
            )
          ),
          h('button', {
            onClick: (e) => {
              e.stopPropagation();
              onDelete(product.id);
            },
            className: "p-1.5 bg-red-500/60 backdrop-blur-sm rounded-full text-white hover:bg-red-500/80 transition-colors"
          },
            h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" })
            )
          )
        ),
        
        // Product info overlay
        h('div', { className: "absolute bottom-0 left-0 right-0 p-3" },
          // Glossy blurred background
          h('div', { className: "absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg" }),
          
          // Content
          h('div', { className: "relative space-y-2" },
            h('h3', { className: "font-semibold text-white line-clamp-1 text-sm drop-shadow-sm" }, product.name),
            h('div', { className: "flex items-center justify-between" },
              h('span', { className: "font-bold text-white text-base drop-shadow-sm" }, formatCurrency(product.price)),
              h('span', { className: `px-2 py-1 text-xs font-medium rounded backdrop-blur-sm ${stockStatus.color}` }, 
                stockStatus.text
              )
            )
          )
        )
      )
    )
  );
};

const InventoryContent = ({ 
  products, 
  loading, 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  currentProducts, 
  categories, 
  currentPage, 
  setCurrentPage, 
  totalPages, 
  startIndex, 
  endIndex, 
  filteredProducts, 
  setSelectedProduct, 
  setShowProductForm, 
  setShowStockModal, 
  handleDeleteProduct 
}) => (
  h('div', { className: "flex flex-col bg-gray-50 h-[calc(100vh-4rem)]" },
    // Search and Add Product Row
    h('div', { className: "bg-white border-b border-gray-200 p-6" },
      h('div', { className: "flex gap-4 items-center" },
        h('div', { className: "flex-1" },
          h(Input, {
            placeholder: "Search products...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            fullWidth: true,
            leftIcon: h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
            )
          })
        ),
        h(Button, {
          onClick: () => {
            setSelectedProduct(null);
            setShowProductForm(true);
          }
        }, "Add Product")
      )
    ),

    // Category Tabs
    h('div', { className: "bg-white border-b border-gray-200" },
      h('div', { className: "flex space-x-8 overflow-x-auto px-6" },
        h('button', {
          onClick: () => setSelectedCategory(''),
          className: `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            selectedCategory === ''
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`
        }, "All Products"),
        categories.map(category => 
          h('button', {
            key: category,
            onClick: () => setSelectedCategory(category),
            className: `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              selectedCategory === category
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }, category.charAt(0).toUpperCase() + category.slice(1).toLowerCase())
        )
      )
    ),

    // Products Grid
    h('div', { className: "flex-1 overflow-y-auto p-6" },
      loading.products ? 
        h(Grid, { cols: { md: 3, lg: 4, xl: 6 }, gap: 3 },
          [...Array(12)].map((_, i) => 
            h('div', { key: i, className: "bg-gray-200 animate-pulse rounded-lg aspect-square" })
          )
        ) :
        currentProducts.length > 0 ?
          h('div', null,
            h(Grid, { cols: { md: 3, lg: 4, xl: 6 }, gap: 3 },
              currentProducts.map(product => 
                h(ProductCard, {
                  key: product.id,
                  product: product,
                  onEdit: (product) => {
                    setSelectedProduct(product);
                    setShowProductForm(true);
                  },
                  onUpdateStock: (product) => {
                    setSelectedProduct(product);
                    setShowStockModal(true);
                  },
                  onDelete: handleDeleteProduct
                })
              )
            ),
            
            // Pagination
            totalPages > 1 && h('div', { className: "flex items-center justify-between mt-8" },
              h('div', { className: "text-sm text-gray-700" },
                `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length} products`
              ),
              
              h('div', { className: "flex items-center space-x-2" },
                h(Button, {
                  variant: "outline",
                  size: "sm",
                  onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)),
                  disabled: currentPage === 1
                }, "Previous"),
                
                // Page numbers
                ...Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return page === 1 || 
                           page === totalPages || 
                           Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    
                    return [
                      showEllipsis && h('span', { key: `ellipsis-${page}`, className: "px-2 text-gray-500" }, "..."),
                      h(Button, {
                        key: page,
                        variant: currentPage === page ? "default" : "outline",
                        size: "sm",
                        onClick: () => setCurrentPage(page),
                        className: currentPage === page ? "bg-blue-600 text-white" : ""
                      }, page.toString())
                    ].filter(Boolean);
                  })
                  .flat(),
                
                h(Button, {
                  variant: "outline",
                  size: "sm",
                  onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
                  disabled: currentPage === totalPages
                }, "Next")
              )
            )
          ) :
          h('div', { className: "text-center py-12" },
            h('svg', { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" })
            ),
            h('h3', { className: "mt-2 text-sm font-medium text-gray-900" }, "No products found"),
            h('p', { className: "mt-1 text-sm text-gray-500" }, "Get started by adding your first product."),
            h('div', { className: "mt-6" },
              h(Button, {
                onClick: () => {
                  setSelectedProduct(null);
                  setShowProductForm(true);
                }
              }, "Add Product")
            )
          )
    )
  )
);

const InventoryPage = () => {
  const { products, loading } = useCache();
  const { createProduct, updateProduct, deleteProduct } = useData();
  const { user } = useAuth();
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const productsPerPage = 18;

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Get unique categories (case-insensitive)
  const categories = [...new Set(
    products
      .map(p => p.category)
      .filter(Boolean)
      .map(cat => cat.toLowerCase())
  )].sort();

  const handleCreateProduct = async (formData) => {
    setFormLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataToSend.append('image', formData[key]);
        } else if (key !== 'image') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/with-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product');
      }

      setShowProductForm(false);
      setSelectedProduct(null);
      setToast({ isOpen: true, message: 'Product created successfully!', type: 'success' });
    } catch (error) {
      console.error('Error creating product:', error);
      setToast({ isOpen: true, message: 'Error creating product: ' + error.message, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (formData) => {
    setFormLoading(true);
    try {
      // Check if we have an image to upload
      const hasImage = formData.image && formData.image instanceof File;
      
      if (hasImage) {
        // Use the with-image endpoint for updates with image uploads
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (key === 'image' && formData[key]) {
            formDataToSend.append('image', formData[key]);
          } else if (key !== 'image') {
            formDataToSend.append(key, formData[key]);
          }
        });

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${selectedProduct.id}/with-image`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: formDataToSend
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update product');
        }
      } else {
        // Use the regular update endpoint for updates without image changes
        const { data, error } = await updateProduct(selectedProduct.id, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock_quantity: formData.stock_type === 'unlimited' ? null : parseInt(formData.stock_quantity) || 0,
          stock_type: formData.stock_type
        });

        if (error) throw error;
      }

      setShowProductForm(false);
      setSelectedProduct(null);
      setToast({ isOpen: true, message: 'Product updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating product:', error);
      setToast({ isOpen: true, message: 'Error updating product: ' + error.message, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStock = async (productId, stockData) => {
    setFormLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(stockData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update stock');
      }

      setShowStockModal(false);
      setSelectedProduct(null);
      setToast({ isOpen: true, message: 'Stock updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating stock:', error);
      setToast({ isOpen: true, message: 'Error updating stock: ' + error.message, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    try {
      const { error } = await deleteProduct(productToDelete.id);
      if (error) throw error;

      setShowDeleteConfirm(false);
      setProductToDelete(null);
      setToast({ isOpen: true, message: 'Product deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({ isOpen: true, message: 'Error deleting product: ' + error.message, type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return h(AppLayout, { currentPath: "/inventory" },
    h(InventoryContent, {
      products,
      loading,
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory,
      currentProducts,
      categories,
      currentPage,
      setCurrentPage,
      totalPages,
      startIndex,
      endIndex,
      filteredProducts,
      setSelectedProduct,
      setShowProductForm,
      setShowStockModal,
      handleDeleteProduct
    }),

    // Modals
    h(ProductForm, {
      isOpen: showProductForm,
      onClose: () => {
        setShowProductForm(false);
        setSelectedProduct(null);
      },
      product: selectedProduct,
      onSubmit: selectedProduct ? handleUpdateProduct : handleCreateProduct,
      loading: formLoading
    }),

    h(StockUpdateModal, {
      isOpen: showStockModal,
      onClose: () => {
        setShowStockModal(false);
        setSelectedProduct(null);
      },
      product: selectedProduct,
      onSubmit: handleUpdateStock,
      loading: formLoading
    }),

    h(ConfirmModal, {
      isOpen: showDeleteConfirm,
      onClose: () => {
        setShowDeleteConfirm(false);
        setProductToDelete(null);
      },
      onConfirm: confirmDeleteProduct,
      title: "Delete Product",
      message: productToDelete ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.` : "",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      loading: deleteLoading
    }),

    h(Toast, {
      isOpen: toast.isOpen,
      onClose: () => setToast({ ...toast, isOpen: false }),
      message: toast.message,
      type: toast.type
    })
  );
};

export default InventoryPage;
