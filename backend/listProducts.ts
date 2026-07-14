import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Store from './src/models/Store';

async function listStores() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const stores = await Store.find({});
  console.log(stores);
  console.log('Total:', stores.length);
  await mongoose.disconnect();
}

listStores();