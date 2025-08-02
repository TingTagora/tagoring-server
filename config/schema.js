const { getDatabase } = require('../config/database');

const createTables = async () => {
  const db = getDatabase();
  
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        firebaseUid TEXT UNIQUE,
        displayName TEXT,
        phone TEXT,
        location TEXT,
        bio TEXT,
        skills TEXT,
        experience TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        isAdmin INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create jobs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT, -- JSON string of array
        isActive INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create applications table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firebaseUid TEXT NOT NULL,
        userEmail TEXT NOT NULL,
        jobTitle TEXT,
        fullName TEXT,
        phone TEXT,
        experience TEXT,
        coverLetter TEXT,
        portfolio TEXT,
        availability TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to users table if they don't exist
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN displayName TEXT`);
    } catch (e) {
      // Column already exists
    }
    
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN phone TEXT`);
    } catch (e) {
      // Column already exists
    }
    
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN location TEXT`);
    } catch (e) {
      // Column already exists
    }
    
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN bio TEXT`);
    } catch (e) {
      // Column already exists
    }
    
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN skills TEXT`);
    } catch (e) {
      // Column already exists
    }
    
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN experience TEXT`);
    } catch (e) {
      // Column already exists
    }

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

module.exports = { createTables };
