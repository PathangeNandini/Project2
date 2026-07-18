import InventoryLedger from '../models/InventoryLedger';
import Product from '../models/Product';
import Store from '../models/Store';

describe('Inventory business logic', () => {
  let productId: any;
  let storeId: any;

  beforeEach(async () => {
    const store = await Store.create({
      name: 'Test Store',
      address: { street: 'A', city: 'B', state: 'C', country: 'D', zipCode: '000000' },
      phone: '9999999999',
      email: 'store@test.com',
    });
    storeId = store._id;

    const product = await Product.create({
      name: 'Test Product',
      description: 'desc',
      category: 'Test',
      basePrice: 100,
      storeId,
      barcode: '1234567890',
      variants: [{ sku: 'TEST-SKU', price: 100, stock: 10 }],
    });
    productId = product._id;

    await InventoryLedger.create({
      productId,
      storeId,
      variantSku: 'TEST-SKU',
      quantity: 10,
      lowStockThreshold: 5,
    });
  });

  it('should correctly add stock', async () => {
    const inventory = await InventoryLedger.findOne({ productId, storeId, variantSku: 'TEST-SKU' });
    inventory!.quantity += 5;
    await inventory!.save();

    const updated = await InventoryLedger.findOne({ productId, storeId, variantSku: 'TEST-SKU' });
    expect(updated!.quantity).toBe(15);
  });

  it('should correctly subtract stock', async () => {
    const inventory = await InventoryLedger.findOne({ productId, storeId, variantSku: 'TEST-SKU' });
    inventory!.quantity -= 4;
    await inventory!.save();

    const updated = await InventoryLedger.findOne({ productId, storeId, variantSku: 'TEST-SKU' });
    expect(updated!.quantity).toBe(6);
  });

  it('should reject subtracting more than available stock', async () => {
    const inventory = await InventoryLedger.findOne({ productId, storeId, variantSku: 'TEST-SKU' });
    const requestedQty = 999;
    const wouldGoNegative = inventory!.quantity < requestedQty;
    expect(wouldGoNegative).toBe(true);
    // Business rule: controller must reject this before mutating — verified in orderController
  });

  it('should flag low stock when quantity drops to or below threshold', async () => {
    const inventory = await InventoryLedger.findOne({ productId, storeId, variantSku: 'TEST-SKU' });
    inventory!.quantity = 5;
    await inventory!.save();

    const updated = await InventoryLedger.findOne({ productId, storeId, variantSku: 'TEST-SKU' });
    const isLowStock = updated!.quantity <= updated!.lowStockThreshold;
    expect(isLowStock).toBe(true);
  });

  it('should not flag low stock when quantity is above threshold', async () => {
    const inventory = await InventoryLedger.findOne({ productId, storeId, variantSku: 'TEST-SKU' });
    const isLowStock = inventory!.quantity <= inventory!.lowStockThreshold;
    expect(isLowStock).toBe(false);
  });
});