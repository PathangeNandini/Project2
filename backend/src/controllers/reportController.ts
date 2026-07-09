import { Request, Response } from 'express';
import Order from '../models/Order';
import InventoryLedger from '../models/InventoryLedger';

// GET /reports/sales
export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, startDate, endDate } = req.query;

    const query: any = { status: 'confirmed' };
    if (storeId) query.storeId = storeId;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const orders = await Order.find(query);

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalTax = orders.reduce((sum, order) => sum + order.totalTax, 0);
    const totalDiscount = orders.reduce((sum, order) => sum + order.totalDiscount, 0);

    const paymentBreakdown = {
      cash: orders.filter((o) => o.paymentMethod === 'cash').length,
      card: orders.filter((o) => o.paymentMethod === 'card').length,
      digital_wallet: orders.filter((o) => o.paymentMethod === 'digital_wallet').length,
    };

    res.status(200).json({
      report: {
        totalRevenue,
        totalOrders,
        totalTax,
        totalDiscount,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        paymentBreakdown,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /reports/daily
export const getDailyReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query: any = {
      status: 'confirmed',
      createdAt: { $gte: today, $lt: tomorrow },
    };
    if (storeId) query.storeId = storeId;

    const orders = await Order.find(query)
      .populate('cashierId', 'name')
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({
      date: today.toISOString().split('T')[0],
      totalOrders: orders.length,
      totalRevenue,
      orders,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /reports/inventory-summary
export const getInventorySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.query;
    const query: any = {};
    if (storeId) query.storeId = storeId;

    const inventory = await InventoryLedger.find(query)
      .populate('productId', 'name category');

    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(
      (item) => item.quantity <= item.lowStockThreshold
    ).length;
    const outOfStockItems = inventory.filter(
      (item) => item.quantity === 0
    ).length;

    res.status(200).json({
      summary: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        healthyItems: totalItems - lowStockItems,
      },
      inventory,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};