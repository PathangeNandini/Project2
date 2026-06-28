import { Request, Response } from 'express';
import Store from '../models/Store';

// GET /stores
export const getAllStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const stores = await Store.find({ isActive: true });
    res.status(200).json({ stores });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /stores/:id
export const getStoreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    res.status(200).json({ store });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /stores
export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = new Store(req.body);
    await store.save();
    res.status(201).json({ message: 'Store created successfully', store });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /stores/:id
export const updateStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    res.status(200).json({ message: 'Store updated successfully', store });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /stores/:id
export const deleteStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};