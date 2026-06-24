import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/database';

// Import all models to register schemas
import './models/User';
import './models/Store';
import './models/Product';
import './models/InventoryLedger';
import './models/Order';
import './models/OrderLineItem';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();