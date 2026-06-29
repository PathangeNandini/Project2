import { Request, Response } from 'express';
import Product from '../models/Product';

// GET /products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, storeId } = req.query;
    const query: any = { isActive: true };

    if (storeId) query.storeId = storeId;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search as string };
    }

    const products = await Product.find(query);
    res.status(200).json({ products, count: products.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /products/:id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /products/barcode/:barcode
export const getProductByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({
      barcode: req.params.barcode,
      isActive: true,
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ product });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /products
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /products/:id
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /products/:id
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
