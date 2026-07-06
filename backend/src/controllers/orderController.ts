import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import OrderLineItem from '../models/OrderLineItem';
import InventoryLedger from '../models/InventoryLedger';
import Product from '../models/Product';

interface CheckoutItem {
  productId: string;
  variantSku: string;
  quantity: number;
  discount?: number;
}

// POST /orders/checkout
// Creates an order, validates stock availability, and decrements inventory.
export const checkout = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const { storeId, items, paymentMethod, notes } = req.body as {
      storeId: string;
      items: CheckoutItem[];
      paymentMethod: 'cash' | 'card' | 'digital_wallet';
      notes?: string;
    };
    const cashierId = (req as any).user.userId;

    if (!storeId || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'storeId and at least one item are required' });
      return;
    }
    if (!paymentMethod) {
      res.status(400).json({ message: 'paymentMethod is required' });
      return;
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    const orderItems: any[] = [];

    await session.withTransaction(async () => {
      for (const line of items) {
        const { productId, variantSku, quantity, discount = 0 } = line;

        if (!productId || !variantSku || !quantity || quantity <= 0) {
          throw Object.assign(new Error('Each item requires productId, variantSku and a positive quantity'), {
            statusCode: 400,
          });
        }

        const product = await Product.findById(productId).session(session);
        if (!product || !product.isActive) {
          throw Object.assign(new Error(`Product ${productId} not found or inactive`), { statusCode: 404 });
        }

        const variant = product.variants.find((v) => v.sku === variantSku);
        if (!variant) {
          throw Object.assign(new Error(`Variant ${variantSku} not found for product ${product.name}`), {
            statusCode: 404,
          });
        }

        const ledger = await InventoryLedger.findOne({ productId, storeId, variantSku }).session(session);
        const available = ledger ? ledger.quantity - ledger.reserved : 0;

        if (!ledger || available < quantity) {
          throw Object.assign(
            new Error(`Insufficient stock for ${product.name} (${variantSku}). Available: ${available}`),
            { statusCode: 400 }
          );
        }

        ledger.quantity -= quantity;
        ledger.lastUpdated = new Date();
        await ledger.save({ session });

        const unitPrice = variant.price ?? product.basePrice;
        const taxRate = 0;
        const lineTotal = unitPrice * quantity - discount;

        subtotal += unitPrice * quantity;
        totalDiscount += discount;
        totalTax += lineTotal * (taxRate / 100);

        orderItems.push({
          productId: product._id,
          productName: product.name,
          variantSku,
          quantity,
          unitPrice,
          discount,
          taxRate,
          totalPrice: lineTotal + lineTotal * (taxRate / 100),
        });
      }

      const totalAmount = subtotal - totalDiscount + totalTax;

      const [order] = await Order.create(
        [
          {
            storeId,
            cashierId,
            items: orderItems,
            subtotal,
            totalDiscount,
            totalTax,
            totalAmount,
            paymentMethod,
            paymentStatus: 'completed',
            status: 'confirmed',
            notes: notes || '',
          },
        ],
        { session }
      );

      await OrderLineItem.create(
        orderItems.map((item) => ({ ...item, orderId: order._id })),
        { session }
      );

      res.status(201).json({ message: 'Order placed successfully', order });
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Checkout failed' });
  } finally {
    session.endSession();
  }
};

// GET /orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, status, cashierId, from, to } = req.query;
    const query: any = {};
    if (storeId) query.storeId = storeId;
    if (status) query.status = status;
    if (cashierId) query.cashierId = cashierId;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from as string);
      if (to) query.createdAt.$lte = new Date(to as string);
    }

    const orders = await Order.find(query)
      .populate('storeId', 'name')
      .populate('cashierId', 'name email')
      .sort('-createdAt');

    res.status(200).json({ orders, count: orders.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /orders/:id
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('storeId', 'name')
      .populate('cashierId', 'name email');
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.status(200).json({ order });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'refunded'];
    if (!allowed.includes(status)) {
      res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
      return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Restock items if an order is being cancelled/refunded
    if ((status === 'cancelled' || status === 'refunded') && order.status !== status) {
      for (const item of order.items) {
        await InventoryLedger.findOneAndUpdate(
          { productId: item.productId, storeId: order.storeId, variantSku: item.variantSku },
          { $inc: { quantity: item.quantity }, lastUpdated: new Date() }
        );
      }
      if (status === 'refunded') order.paymentStatus = 'refunded';
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
