const express = require('express');
const multer = require('multer');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const { uploadImage, deleteImage, getThumbnailUrl } = require('../config/cloudinary');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all products with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: products, error } = await query.order('name');

    if (error) throw error;

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Create new product (admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock_quantity, stock_type } = req.body;

    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        category,
        image_url,
        stock_quantity: stock_type === 'unlimited' ? null : parseInt(stock_quantity) || 0,
        stock_type: stock_type || 'tracked',
        active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create product'
    });
  }
});

// Update product (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Convert numeric fields
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.stock_quantity !== undefined) {
      updates.stock_quantity = updates.stock_type === 'unlimited' ? null : parseInt(updates.stock_quantity) || 0;
    }

    // Ensure stock_type is valid
    if (updates.stock_type && !['tracked', 'unlimited', 'recipe-based'].includes(updates.stock_type)) {
      updates.stock_type = 'tracked';
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update product'
    });
  }
});

// Delete product (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// Create product with image upload (admin only)
router.post('/with-image', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock_quantity, stock_type } = req.body;
    let imageUrl = null;
    let imagePublicId = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
      const uploadResult = await uploadImage(req.file, 'pos-products');
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.public_id;
    }

    // Prepare product data
    const productData = {
      name,
      description,
      price: parseFloat(price),
      category,
      image_url: imageUrl,
      stock_quantity: stock_type === 'unlimited' ? null : parseInt(stock_quantity) || 0,
      stock_type: stock_type || 'tracked',
      active: true
    };

    // Only add image_public_id if we have it (for backward compatibility)
    if (imagePublicId) {
      productData.image_public_id = imagePublicId;
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product with image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create product'
    });
  }
});

// Update product with image upload (admin only)
router.put('/:id/with-image', protect, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    console.log('Updating product with image:', {
      productId: id,
      hasFile: !!req.file,
      updates: updates
    });

    // Get current product to check for existing image
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('image_public_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current product:', fetchError);
      throw fetchError;
    }

    // Upload new image to Cloudinary if provided
    if (req.file) {
      console.log('Processing image upload...');
      
      // Delete old image if exists (only if image_public_id column exists)
      if (currentProduct && currentProduct.image_public_id) {
        try {
          console.log('Deleting old image:', currentProduct.image_public_id);
          await deleteImage(currentProduct.image_public_id);
        } catch (deleteError) {
          console.warn('Failed to delete old image:', deleteError);
        }
      }

      const uploadResult = await uploadImage(req.file, 'pos-products');
      updates.image_url = uploadResult.url;
      
      // Only set image_public_id if the column exists (for backward compatibility)
      try {
        updates.image_public_id = uploadResult.public_id;
      } catch (error) {
        console.warn('image_public_id column may not exist, skipping...');
      }
      
      console.log('Image uploaded successfully:', uploadResult.url);
    }

    // Convert numeric fields
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.stock_quantity !== undefined) {
      updates.stock_quantity = updates.stock_type === 'unlimited' ? null : parseInt(updates.stock_quantity) || 0;
    }

    // Ensure stock_type is valid
    if (updates.stock_type && !['tracked', 'unlimited', 'recipe-based'].includes(updates.stock_type)) {
      updates.stock_type = 'tracked';
    }

    console.log('Final updates to apply:', updates);

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    console.log('Product updated successfully:', product.id);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product with image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update product'
    });
  }
});

// Upload image only (admin only)
router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const uploadResult = await uploadImage(req.file, 'pos-products');

    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        thumbnail_url: getThumbnailUrl(uploadResult.public_id)
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// Delete image (admin only)
router.delete('/image/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const result = await deleteImage(publicId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

// Update product stock
router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity, operation } = req.body; // operation: 'set', 'add', 'subtract'

    // Get current product
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity, stock_type')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (currentProduct.stock_type === 'unlimited') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update stock for unlimited stock products'
      });
    }

    let newStockQuantity;
    switch (operation) {
      case 'set':
        newStockQuantity = parseInt(stock_quantity);
        break;
      case 'add':
        newStockQuantity = currentProduct.stock_quantity + parseInt(stock_quantity);
        break;
      case 'subtract':
        newStockQuantity = Math.max(0, currentProduct.stock_quantity - parseInt(stock_quantity));
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation. Use "set", "add", or "subtract"'
        });
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({ stock_quantity: newStockQuantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock'
    });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('products')
      .select('category')
      .eq('active', true)
      .not('category', 'is', null);

    if (error) throw error;

    const uniqueCategories = [...new Set(categories.map(item => item.category))];

    res.json({
      success: true,
      data: uniqueCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
