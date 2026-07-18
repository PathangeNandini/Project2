import { Request, Response } from 'express';
import Product from '../models/Product';
import { clearCache } from '../middleware/cacheMiddleware';

// GET /products
// Supports cursor-based pagination via ?cursor=<lastId>&limit=<n>
// Supports full-text search via ?search=<term> (uses the text index on name/description/category)
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, storeId, cursor, limit } = req.query;
    const pageSize = Math.min(Number(limit) || 20, 100); // cap at 100 per page

    const query: any = { isActive: true };

    if (storeId) query.storeId = storeId;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search as string };
    }

    // Cursor-based pagination: fetch documents with _id greater than the cursor
    if (cursor) {
      query._id = { $gt: cursor };
    }

    let productQuery = Product.find(query).sort({ _id: 1 }).limit(pageSize + 1);

    // When searching, sort by text relevance score instead of _id
    if (search) {
      productQuery = Product.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(pageSize + 1);
    }

    const results = await productQuery;

    // If we got one extra doc, there's a next page
    const hasMore = results.length > pageSize;
    const products = hasMore ? results.slice(0, pageSize) : results;
    const nextCursor = hasMore ? products[products.length - 1]._id : null;

    res.status(200).json({
      products,
      count: products.length,
      nextCursor,
      hasMore,
    });
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
    await clearCache('/products');
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
    await clearCache('/products');
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
    await clearCache('/products');
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};