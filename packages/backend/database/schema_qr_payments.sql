-- QR Payments Database Schema
-- Run these commands in your Supabase SQL editor to add QR payment support

-- Create QR payments table
CREATE TABLE IF NOT EXISTS qr_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'PHP',
    merchant_id VARCHAR(100),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    payment_method VARCHAR(50) DEFAULT 'qr_payment',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'expired', 'failed')),
    
    -- Gateway information
    payment_gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    gateway_reference VARCHAR(255),
    gateway_response JSONB,
    
    -- QR code data
    qr_data TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_reason TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_payments_transaction_id ON qr_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_qr_payments_order_id ON qr_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_qr_payments_status ON qr_payments(status);
CREATE INDEX IF NOT EXISTS idx_qr_payments_created_at ON qr_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_payments_expires_at ON qr_payments(expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_payments_gateway_transaction_id ON qr_payments(gateway_transaction_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_qr_payments_updated_at ON qr_payments;
CREATE TRIGGER update_qr_payments_updated_at 
    BEFORE UPDATE ON qr_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired QR payments
CREATE OR REPLACE FUNCTION cleanup_expired_qr_payments()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired pending payments
    UPDATE qr_payments 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get QR payment statistics
CREATE OR REPLACE FUNCTION get_qr_payment_stats(
    date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(
    total_transactions BIGINT,
    completed_transactions BIGINT,
    pending_transactions BIGINT,
    cancelled_transactions BIGINT,
    expired_transactions BIGINT,
    total_amount DECIMAL(12, 2),
    completed_amount DECIMAL(12, 2),
    average_transaction_amount DECIMAL(10, 2),
    success_rate DECIMAL(5, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_transactions,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_transactions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_transactions,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_transactions,
        COUNT(*) FILTER (WHERE status = 'expired') as expired_transactions,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as completed_amount,
        COALESCE(AVG(amount), 0) as average_transaction_amount,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0 
        END as success_rate
    FROM qr_payments
    WHERE (date_from IS NULL OR created_at >= date_from)
    AND (date_to IS NULL OR created_at <= date_to);
END;
$$ LANGUAGE plpgsql;

-- Add QR payment reference to orders table (optional)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS qr_payment_transaction_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS qr_payment_gateway VARCHAR(50);

-- Create index for QR payment reference in orders
CREATE INDEX IF NOT EXISTS idx_orders_qr_payment_transaction_id ON orders(qr_payment_transaction_id);

-- Sample data for testing (optional)
-- INSERT INTO qr_payments (
--     transaction_id, 
--     order_id, 
--     amount, 
--     merchant_id, 
--     customer_name, 
--     customer_email,
--     expires_at
-- ) VALUES (
--     'QR' || EXTRACT(EPOCH FROM NOW())::BIGINT || 'TEST',
--     'ORDER123',
--     150.00,
--     'MERCHANT001',
--     'Test Customer',
--     'test@example.com',
--     NOW() + INTERVAL '5 minutes'
-- );

-- Create view for QR payment summary
CREATE OR REPLACE VIEW qr_payment_summary AS
SELECT 
    qp.transaction_id,
    qp.order_id,
    qp.amount,
    qp.currency,
    qp.customer_name,
    qp.status,
    qp.payment_gateway,
    qp.created_at,
    qp.completed_at,
    qp.expires_at,
    o.customer_name as order_customer_name,
    o.total_amount as order_total_amount
FROM qr_payments qp
LEFT JOIN orders o ON qp.order_id = o.id::TEXT
ORDER BY qp.created_at DESC;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON qr_payments TO authenticated;
-- GRANT SELECT ON qr_payment_summary TO authenticated;
-- GRANT EXECUTE ON FUNCTION cleanup_expired_qr_payments() TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_qr_payment_stats(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;

-- Create RLS policies (adjust as needed for your security requirements)
-- ALTER TABLE qr_payments ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to see their own QR payments
-- CREATE POLICY "Users can view their own QR payments" ON qr_payments
--     FOR SELECT USING (auth.uid()::text = created_by);

-- Policy for service role to manage all QR payments
-- CREATE POLICY "Service role can manage QR payments" ON qr_payments
--     FOR ALL USING (auth.role() = 'service_role');
