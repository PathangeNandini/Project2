import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import InventoryLedger from './src/models/InventoryLedger';

async function listInventory() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const entries = await InventoryLedger.find({});
  console.log(entries);
  console.log('Total:', entries.length);
  await mongoose.disconnect();
}

listInventory();