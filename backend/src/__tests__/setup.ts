import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

beforeAll(async () => {
  const baseUri = process.env.MONGO_URI as string;
  // Point tests at a separate database so they never touch real dev data
  const testUri = baseUri.replace(/\/[^/]+$/, '/omnichannel_pos_test');
  await mongoose.connect(testUri);
});

afterEach(async () => {
  // Clean all collections between tests so each test starts fresh
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});