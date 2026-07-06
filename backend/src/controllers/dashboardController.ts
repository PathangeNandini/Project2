import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Store from '../models/Store';
import InventoryLedger from '../models/InventoryLedger';

// GET /dashboard/summary
export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const storeId = req.query.storeId as string | undefined;
    const matchStore: Record<string, any> = {};
    if (storeId) matchStore.storeId = storeId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalStores,
      totalOrders,
      todayOrders,
      revenueAgg,
      todayRevenueAgg,
      inventory,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true, ...(storeId && { storeId }) } as any),
      Store.countDocuments({ isActive: true }),
      Order.countDocuments({ ...matchStore, status: { $ne: 'cancelled' } }),
      Order.countDocuments({ ...matchStore, status: { $ne: 'cancelled' }, createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        { $match: { ...matchStore, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { ...matchStore, status: { $ne: 'cancelled' }, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      InventoryLedger.find((storeId ? { storeId } : {}) as any),
      Order.find(matchStore)
        .populate('storeId', 'name')
        .populate('cashierId', 'name')
        .sort('-createdAt')
        .limit(5),
    ]);

    const lowStockCount = inventory.filter((i) => i.quantity <= i.lowStockThreshold).length;

    // Last 7 days sales trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesTrend = await Order.aggregate([
      { $match: { ...matchStore, status: { $ne: 'cancelled' }, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      totalProducts,
      totalStores,
      totalOrders,
      todayOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      todayRevenue: todayRevenueAgg[0]?.total || 0,
      lowStockCount,
      recentOrders,
      salesTrend: salesTrend.map((d) => ({ date: d._id, total: d.total, orders: d.orders })),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
