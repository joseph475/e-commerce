const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');

async function setupDemoUsers() {
  try {
    console.log('Setting up demo users...');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const cashierPasswordHash = await bcrypt.hash('cashier123', 10);

    // Delete existing demo users if they exist
    await supabase
      .from('users')
      .delete()
      .in('email', ['admin@pos.com', 'cashier@pos.com']);

    // Insert demo users with proper password hashes
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@pos.com',
          password_hash: adminPasswordHash,
          full_name: 'Admin User',
          role: 'admin',
          active: true
        },
        {
          email: 'cashier@pos.com',
          password_hash: cashierPasswordHash,
          full_name: 'Cashier User',
          role: 'cashier',
          active: true
        }
      ])
      .select();

    if (error) {
      console.error('Error creating demo users:', error);
      return;
    }

    console.log('Demo users created successfully:');
    console.log('- Admin: admin@pos.com / admin123');
    console.log('- Cashier: cashier@pos.com / cashier123');
    console.log('Users data:', data);

  } catch (error) {
    console.error('Error setting up demo users:', error);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupDemoUsers().then(() => {
    console.log('Demo user setup completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Demo user setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupDemoUsers };
