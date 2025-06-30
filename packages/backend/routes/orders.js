const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all orders with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, date_from, date_to, limit = 50 } = req.query;
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          products (
            id,
            name,
            category
          )
        )
      `);

    if (status) {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: orders, error } = await query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          products (
            id,
            name,
            description,
            category,
            image_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      items, 
      payment_method, 
      discount_amount = 0,
      tax_amount = 0,
      notes,
      status = 'pending'
    } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const total_amount = subtotal + tax_amount - discount_amount;

    // Start transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        customer_email,
        customer_phone,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        payment_method,
        status,
        notes
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of items) {
      const { error: stockError } = await supabase
        .rpc('update_product_stock', {
          product_id: item.product_id,
          quantity_sold: item.quantity
        });

      if (stockError) {
        console.error('Error updating stock for product:', item.product_id, stockError);
      }
    }

    // Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          products (
            id,
            name,
            category
          )
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) throw fetchError;

    res.status(201).json({
      success: true,
      data: completeOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// Get order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let query = supabase
      .from('orders')
      .select('total_amount, status, created_at');

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    const stats = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
      completed_orders: orders.filter(order => order.status === 'completed').length,
      pending_orders: orders.filter(order => order.status === 'pending').length,
      cancelled_orders: orders.filter(order => order.status === 'cancelled').length,
      average_order_value: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics'
    });
  }
});

module.exports = router;
