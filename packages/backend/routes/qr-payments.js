const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Create QR payment transaction
router.post('/create', async (req, res) => {
  try {
    const { 
      order_id,
      amount,
      currency = 'PHP',
      merchant_id,
      customer_info,
      payment_method = 'qr_payment'
    } = req.body;

    // Generate unique transaction ID
    const transaction_id = `QR${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Create QR payment record
    const { data: qrPayment, error } = await supabase
      .from('qr_payments')
      .insert([{
        transaction_id,
        order_id,
        amount,
        currency,
        merchant_id,
        customer_name: customer_info?.name,
        customer_email: customer_info?.email,
        customer_phone: customer_info?.phone,
        payment_method,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes expiry
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: {
        transaction_id,
        qr_data: generateQRData({
          transaction_id,
          amount,
          currency,
          merchant_id,
          description: `Order ${order_id}`
        }),
        expires_at: qrPayment.expires_at
      }
    });
  } catch (error) {
    console.error('Error creating QR payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create QR payment'
    });
  }
});

// Check QR payment status
router.get('/status/:transaction_id', async (req, res) => {
  try {
    const { transaction_id } = req.params;
    
    const { data: qrPayment, error } = await supabase
      .from('qr_payments')
      .select('*')
      .eq('transaction_id', transaction_id)
      .single();

    if (error) throw error;

    if (!qrPayment) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Check if transaction has expired
    const now = new Date();
    const expiresAt = new Date(qrPayment.expires_at);
    
    if (now > expiresAt && qrPayment.status === 'pending') {
      // Update status to expired
      await supabase
        .from('qr_payments')
        .update({ status: 'expired' })
        .eq('transaction_id', transaction_id);
      
      qrPayment.status = 'expired';
    }

    res.json({
      success: true,
      data: {
        transaction_id: qrPayment.transaction_id,
        status: qrPayment.status,
        amount: qrPayment.amount,
        currency: qrPayment.currency,
        created_at: qrPayment.created_at,
        expires_at: qrPayment.expires_at,
        completed_at: qrPayment.completed_at
      }
    });
  } catch (error) {
    console.error('Error checking QR payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check payment status'
    });
  }
});

// Confirm QR payment (webhook endpoint for payment gateways)
router.post('/confirm/:transaction_id', async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { 
      gateway_transaction_id,
      gateway_reference,
      payment_gateway = 'manual',
      gateway_response 
    } = req.body;

    // Verify transaction exists and is pending
    const { data: qrPayment, error: fetchError } = await supabase
      .from('qr_payments')
      .select('*')
      .eq('transaction_id', transaction_id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !qrPayment) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or not pending'
      });
    }

    // Check if transaction has expired
    const now = new Date();
    const expiresAt = new Date(qrPayment.expires_at);
    
    if (now > expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'Transaction has expired'
      });
    }

    // Update payment status to completed
    const { data: updatedPayment, error: updateError } = await supabase
      .from('qr_payments')
      .update({
        status: 'completed',
        gateway_transaction_id,
        gateway_reference,
        payment_gateway,
        gateway_response: JSON.stringify(gateway_response),
        completed_at: new Date().toISOString()
      })
      .eq('transaction_id', transaction_id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      data: {
        transaction_id: updatedPayment.transaction_id,
        status: updatedPayment.status,
        completed_at: updatedPayment.completed_at
      }
    });
  } catch (error) {
    console.error('Error confirming QR payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment'
    });
  }
});

// Cancel QR payment
router.post('/cancel/:transaction_id', async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { reason = 'User cancelled' } = req.body;

    const { data: updatedPayment, error } = await supabase
      .from('qr_payments')
      .update({
        status: 'cancelled',
        cancelled_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq('transaction_id', transaction_id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      data: {
        transaction_id: updatedPayment.transaction_id,
        status: updatedPayment.status,
        cancelled_at: updatedPayment.cancelled_at
      }
    });
  } catch (error) {
    console.error('Error cancelling QR payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel payment'
    });
  }
});

// Get QR payment history
router.get('/history', async (req, res) => {
  try {
    const { 
      status, 
      date_from, 
      date_to, 
      limit = 50,
      offset = 0 
    } = req.query;
    
    let query = supabase
      .from('qr_payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: payments, error } = await query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching QR payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment history'
    });
  }
});

// Generate QR data in QRPH format
function generateQRData({ transaction_id, amount, currency, merchant_id, description }) {
  // QRPH EMV format
  const qrphData = {
    // Payload Format Indicator
    '00': '01',
    // Point of Initiation Method
    '01': '12', // Dynamic QR
    // Merchant Account Information
    '26': {
      '00': 'PH.QR.01', // QRPH identifier
      '01': merchant_id || 'MERCHANT001',
      '02': 'Your Business Name'
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
    '59': 'Your Business Name'.substring(0, 25),
    // Merchant City
    '60': 'Manila',
    // Additional Data Field
    '62': {
      '01': transaction_id, // Bill Number
      '05': description.substring(0, 25) // Reference Label
    }
  };

  return convertToEMVString(qrphData);
}

// Convert QR data object to EMV string format
function convertToEMVString(data) {
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
}

// Simplified CRC16 calculation
function calculateCRC16(data) {
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
}

module.exports = router;
