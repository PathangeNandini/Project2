import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  const uri = process.env.MONGO_URI as string;
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});