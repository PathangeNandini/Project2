import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Product from './src/models/Product';
import InventoryLedger from './src/models/InventoryLedger';

async function seedInventory() {
  await mongoose.connect(process.env.MONGO_URI as string);

  const products = await Product.find({});
  let created = 0;

  for (const product of products) {
    for (const variant of product.variants) {
      const exists = await InventoryLedger.findOne({
        productId: product._id,
        storeId: product.storeId,
        variantSku: variant.sku,
      });

      if (!exists) {
        await InventoryLedger.create({
          productId: product._id,
          storeId: product.storeId,
          variantSku: variant.sku,
          quantity: variant.stock,
          reserved: 0,
          lowStockThreshold: 5,
        });
        created++;
      }
    }
  }

  console.log(`Created ${created} inventory ledger entries.`);
  await mongoose.disconnect();
}

seedInventory().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});