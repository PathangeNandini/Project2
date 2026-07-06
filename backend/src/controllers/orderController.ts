import { Request, Response } from 'express';
import Order from '../models/Order';
import InventoryLedger from '../models/InventoryLedger';
import mongoose from 'mongoose';

// GET /orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, status, startDate, endDate } = req.query;
    const query: any = {};

    if (storeId) query.storeId = storeId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const orders = await Order.find(query)
      .populate('cashierId', 'name email')
      .populate('storeId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ orders, count: orders.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /orders/:id
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cashierId', 'name email')
      .populate('storeId', 'name')
      .populate('items.productId', 'name category');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.status(200).json({ order });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /orders
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { storeId, items, paymentMethod, notes } = req.body;
    const cashierId = (req as any).user.userId;

    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const processedItems = items.map((item: any) => {
      const itemTotal = item.unitPrice * item.quantity;
      const itemDiscount = item.discount || 0;
      const itemTax = (itemTotal - itemDiscount) * ((item.taxRate || 0) / 100);

      subtotal += itemTotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;

      return {
        ...item,
        discount: itemDiscount,
        taxRate: item.taxRate || 0,
        totalPrice: itemTotal - itemDiscount + itemTax,
      };
    });

    const totalAmount = subtotal - totalDiscount + totalTax;

    // Check and deduct inventory for each item
    for (const item of processedItems) {
      const inventory = await InventoryLedger.findOne({
        productId: item.productId,
        storeId,
        variantSku: item.variantSku,
      }).session(session);

      if (!inventory) {
        await session.abortTransaction();
        res.status(400).json({
          message: `Inventory not found for SKU: ${item.variantSku}`,
        });
        return;
      }

      if (inventory.quantity < item.quantity) {
        await session.abortTransaction();
        res.status(400).json({
          message: `Insufficient stock for SKU: ${item.variantSku}. Available: ${inventory.quantity}`,
        });
        return;
      }

      inventory.quantity -= item.quantity;
      inventory.lastUpdated = new Date();
      await inventory.save({ session });
    }

    // Create order
    const order = new Order({
      storeId,
      cashierId,
      items: processedItems,
      subtotal,
      totalDiscount,
      totalTax,
      totalAmount,
      paymentMethod,
      paymentStatus: 'completed',
      status: 'confirmed',
      notes,
    });

    await order.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// PUT /orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.status(200).json({ message: 'Order status updated', order });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /orders/:id/refund
export const refundOrder = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status === 'refunded') {
      await session.abortTransaction();
      res.status(400).json({ message: 'Order already refunded' });
      return;
    }

    // Restore inventory
    for (const item of order.items) {
      const inventory = await InventoryLedger.findOne({
        productId: item.productId,
        storeId: order.storeId,
        variantSku: item.variantSku,
      }).session(session);

      if (inventory) {
        inventory.quantity += item.quantity;
        await inventory.save({ session });
      }
    }

    order.status = 'refunded';
    order.paymentStatus = 'refunded';
    await order.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Order refunded successfully', order });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};