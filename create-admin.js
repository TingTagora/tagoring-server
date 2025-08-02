require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@tagora.online';
const ADMIN_UID = 'I6Mg1yBgghZ2fiNoxbZLko1outq2';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingUser = await User.findOne({ firebaseUid: ADMIN_UID });
    if (existingUser) {
      console.log('Admin user already exists, updating fields...');
      existingUser.isAdmin = true;
      existingUser.name = existingUser.name || 'Admin User';
      existingUser.password = existingUser.password || 'placeholder';
      await existingUser.save();
      console.log('Admin user updated successfully!');
    } else {
      // Create new admin user
      const adminUser = new User({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        firebaseUid: ADMIN_UID,
        password: 'placeholder', // Not used since we use Firebase Auth
        role: 'admin',
        isAdmin: true
      });

      await adminUser.save();
      console.log('Admin user created successfully!');
    }

    console.log('Admin user details:');
    const admin = await User.findOne({ firebaseUid: ADMIN_UID });
    console.log(JSON.stringify(admin, null, 2));

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
