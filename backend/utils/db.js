const { MongoClient } = require('mongodb');

let db = null;
let client = null;

const connectDB = async () => {
  try {
    if (db) {
      return db;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not defined in environment variables');
    }

    client = new MongoClient(uri);
    await client.connect();
    db = client.db();

    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
};

module.exports = { connectDB, getDB, closeDB };
