import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Store from './src/models/Store';
import Product from './src/models/Product';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);

  // 1. Find or create a store
  let store = await Store.findOne({});
  if (!store) {
    store = await Store.create({
      name: 'Main Store',
      address: {
        street: '123 MG Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        zipCode: '600001',
      },
      phone: '9999999999',
      email: 'store@omnipos.com',
    });
    console.log('Created store:', store.name, store._id);
  } else {
    console.log('Using existing store:', store.name, store._id);
  }

  // 2. Seed products (each with variants)
  const products = [
    {
      name: 'Classic T-Shirt',
      description: 'Soft cotton crew-neck t-shirt',
      category: 'Apparel',
      basePrice: 499,
      storeId: store._id,
      barcode: '8901000000011',
      variants: [
        { size: 'S', color: 'Black', sku: 'TSHIRT-BLK-S', price: 499, stock: 25 },
        { size: 'M', color: 'Black', sku: 'TSHIRT-BLK-M', price: 499, stock: 30 },
        { size: 'L', color: 'White', sku: 'TSHIRT-WHT-L', price: 549, stock: 15 },
      ],
    },
    {
      name: 'Denim Jeans',
      description: 'Slim fit denim jeans',
      category: 'Apparel',
      basePrice: 1299,
      storeId: store._id,
      barcode: '8901000000028',
      variants: [
        { size: '30', color: 'Blue', sku: 'JEANS-BLU-30', price: 1299, stock: 10 },
        { size: '32', color: 'Blue', sku: 'JEANS-BLU-32', price: 1299, stock: 12 },
      ],
    },
    {
      name: 'Running Shoes',
      description: 'Lightweight running shoes',
      category: 'Footwear',
      basePrice: 2499,
      storeId: store._id,
      barcode: '8901000000035',
      variants: [
        { size: '8', color: 'Grey', sku: 'SHOES-GRY-8', price: 2499, stock: 8 },
        { size: '9', color: 'Grey', sku: 'SHOES-GRY-9', price: 2499, stock: 0 },
      ],
    },
    {
      name: 'Coffee Mug',
      description: 'Ceramic coffee mug, 350ml',
      category: 'Home',
      basePrice: 299,
      storeId: store._id,
      barcode: '8901000000042',
      variants: [
        { color: 'White', sku: 'MUG-WHT', price: 299, stock: 40 },
      ],
    },
  ];

  await Product.deleteMany({ storeId: store._id }); // clear old test data for this store
  const created = await Product.insertMany(products);
  console.log(`Seeded ${created.length} products.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});