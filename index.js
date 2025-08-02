require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { initializeDatabase } = require('./config/database');
const { createTables } = require('./config/schema');

// Initialize Firebase Admin SDK
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'tagora-e5ab7',
});

const app = express();

// Configure CORS for your hosted applications
const corsOptions = {
  origin: [
    'http://localhost:3000',           // Local main app
    'http://localhost:3001',           // Local admin panel
    'https://tagora.online',   // Hosted main app
    'https://tagoring.onrender.com/', // Hosted admin panel
    // Add your actual Render URLs here
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Turso database
initializeDatabase();
createTables()
  .then(() => console.log('Turso database connected and tables created'))
  .catch(err => console.error('Database initialization error:', err));

// Example route
app.get('/', (req, res) => {
  res.send('API is running');
});

// API routes
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/stats'));
app.use('/api/admin-auth', require('./routes/admin-auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));