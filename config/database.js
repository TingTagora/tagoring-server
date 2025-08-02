const { createClient } = require('@libsql/client');

let client;

function initializeDatabase() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

function getDatabase() {
  if (!client) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return client;
}

module.exports = {
  initializeDatabase,
  getDatabase
};
