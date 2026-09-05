const mongoose = require('mongoose');
const dns = require('dns');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adarshdeepsachan_db_user:e4BSFPaMzAOtflje@digitalverse.9qnp6vn.mongodb.net/?retryWrites=true&w=majority&appName=digitalverse';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'digitalverse';

let isConnected = false;

async function connectMongoDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  if (!MONGODB_URI) {
    console.warn('MongoDB URI not provided in environment variables');
    return null;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 8000
    });

    isConnected = true;
    console.log(`[MongoDB Atlas] Successfully connected to database: ${MONGODB_DB_NAME}`);
    return conn;
  } catch (error) {
    // If SRV lookup failed due to ISP/local Windows DNS, retry with Google public DNS
    if (error.message && error.message.includes('querySrv')) {
      try {
        console.log('[MongoDB Atlas] Retrying with public DNS resolver...');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const retryConn = await mongoose.connect(MONGODB_URI, {
          dbName: MONGODB_DB_NAME,
          serverSelectionTimeoutMS: 8000
        });
        isConnected = true;
        console.log(`[MongoDB Atlas] Successfully connected to database: ${MONGODB_DB_NAME} (via public DNS)`);
        return retryConn;
      } catch (retryErr) {
        console.error('[MongoDB Atlas] Retry failed:', retryErr.message);
      }
    }

    console.error('[MongoDB Atlas] Connection failed:', error.message);
    isConnected = false;
    return null;
  }
}

function getMongoStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    dbName: MONGODB_DB_NAME,
    host: mongoose.connection.host || 'digitalverse.9qnp6vn.mongodb.net'
  };
}

module.exports = {
  connectMongoDB,
  getMongoStatus,
  mongoose
};
