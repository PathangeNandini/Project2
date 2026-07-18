import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import Store from '../models/Store';
import Product from '../models/Product';
import InventoryLedger from '../models/InventoryLedger';
import User from '../models/User';

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
};

describe('Order creation — transactional integrity', () => {
  let storeId: any;
  let productId: any;
  let token: string;

  beforeEach(async () => {
    const store = await Store.create({
      name: 'Test Store',
      address: { street: 'A', city: 'B', state: 'C', country: 'D', zipCode: '000000' },
      phone: '9999999999',
      email: 'store@test.com',
    });
    storeId = store._id;

    const user = await User.create({
      name: 'Test Cashier',
      email: 'cashier@test.com',
      passwordHash: 'hashedpw', // pre-save hook will hash this
      role: 'cashier',
      storeId,
    });

    token = generateToken(user._id.toString(), 'cashier');

    const product = await Product.create({
      name: 'Test Shirt',
      description: 'desc',
      category: 'Apparel',
      basePrice: 500,
      storeId,
      barcode: '9999999999999',
      variants: [{ sku: 'SHIRT-TEST', price: 500, stock: 5 }],
    });
    productId = product._id;

    await InventoryLedger.create({
      productId,
      storeId,
      variantSku: 'SHIRT-TEST',
      quantity: 5,
      lowStockThreshold: 2,
    });
  });

  it('should create an order and deduct inventory atomically', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        storeId,
        paymentMethod: 'cash',
        items: [
          {
            productId,
            variantSku: 'SHIRT-TEST',
            quantity: 2,
            unitPrice: 500,
            discount: 0,
            taxRate: 5,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.order.orderNumber).toBeDefined();
    expect(res.body.order.totalAmount).toBeCloseTo(1050); // (500*2) + 5% tax

    const inventory = await InventoryLedger.findOne({ productId, storeId, variantSku: 'SHIRT-TEST' });
    expect(inventory!.quantity).toBe(3); // 5 - 2
  });

  it('should reject order and NOT deduct inventory when stock is insufficient', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        storeId,
        paymentMethod: 'cash',
        items: [
          {
            productId,
            variantSku: 'SHIRT-TEST',
            quantity: 999, // way more than the 5 in stock
            unitPrice: 500,
            discount: 0,
            taxRate: 5,
          },
        ],
      });

    expect(res.status).toBe(400);

    // Critical check: inventory must remain untouched since the transaction rolled back
    const inventory = await InventoryLedger.findOne({ productId, storeId, variantSku: 'SHIRT-TEST' });
    expect(inventory!.quantity).toBe(5);
  });

  it('should reject order creation without authentication', async () => {
    const res = await request(app)
      .post('/orders')
      .send({ storeId, paymentMethod: 'cash', items: [] });

    expect(res.status).toBe(401);
  });
});