import { Request, Response } from 'express';
import InventoryLedger from '../models/InventoryLedger';
import Product from '../models/Product';

// GET /inventory
export const getAllInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.query;
    const query: any = {};
    if (storeId) query.storeId = storeId;

    const inventory = await InventoryLedger.find(query)
      .populate('productId', 'name category barcode')
      .populate('storeId', 'name');

    res.status(200).json({ inventory, count: inventory.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /inventory/low-stock
export const getLowStockItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.query;
    const query: any = {};
    if (storeId) query.storeId = storeId;

    const allInventory = await InventoryLedger.find(query)
      .populate('productId', 'name category barcode');

    const lowStock = allInventory.filter(
      (item) => item.quantity <= item.lowStockThreshold
    );

    res.status(200).json({ lowStockItems: lowStock, count: lowStock.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /inventory/:productId/:storeId
export const getInventoryByProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, storeId } = req.params;
    const inventory = await InventoryLedger.find({ productId, storeId })
      .populate('productId', 'name category')
      .populate('storeId', 'name');

    if (!inventory.length) {
      res.status(404).json({ message: 'Inventory not found' });
      return;
    }

    res.status(200).json({ inventory });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /inventory
export const createInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, storeId, variantSku, quantity, lowStockThreshold } = req.body;

    const existing = await InventoryLedger.findOne({ productId, storeId, variantSku });
    if (existing) {
      res.status(400).json({ message: 'Inventory record already exists for this product and store' });
      return;
    }

    const inventory = new InventoryLedger({
      productId,
      storeId,
      variantSku,
      quantity: quantity || 0,
      lowStockThreshold: lowStockThreshold || 10,
    });

    await inventory.save();
    res.status(201).json({ message: 'Inventory created successfully', inventory });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /inventory/update-stock
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, storeId, variantSku, quantity, operation } = req.body;

    const inventory = await InventoryLedger.findOne({ productId, storeId, variantSku });
    if (!inventory) {
      res.status(404).json({ message: 'Inventory record not found' });
      return;
    }

    if (operation === 'add') {
      inventory.quantity += quantity;
    } else if (operation === 'subtract') {
      if (inventory.quantity < quantity) {
        res.status(400).json({ message: 'Insufficient stock' });
        return;
      }
      inventory.quantity -= quantity;
    } else if (operation === 'set') {
      inventory.quantity = quantity;
    }

    inventory.lastUpdated = new Date();
    await inventory.save();

    res.status(200).json({
      message: 'Stock updated successfully',
      inventory,
      isLowStock: inventory.quantity <= inventory.lowStockThreshold,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /inventory/transfer
export const transferStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, variantSku, fromStoreId, toStoreId, quantity } = req.body;

    const fromInventory = await InventoryLedger.findOne({
      productId,
      storeId: fromStoreId,
      variantSku,
    });

    if (!fromInventory) {
      res.status(404).json({ message: 'Source inventory not found' });
      return;
    }

    if (fromInventory.quantity < quantity) {
      res.status(400).json({ message: 'Insufficient stock in source store' });
      return;
    }

    let toInventory = await InventoryLedger.findOne({
      productId,
      storeId: toStoreId,
      variantSku,
    });

    if (!toInventory) {
      toInventory = new InventoryLedger({
        productId,
        storeId: toStoreId,
        variantSku,
        quantity: 0,
      });
    }

    fromInventory.quantity -= quantity;
    toInventory.quantity += quantity;

    await fromInventory.save();
    await toInventory.save();

    res.status(200).json({
      message: 'Stock transferred successfully',
      from: fromInventory,
      to: toInventory,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
