import mongoose, { Document, Schema } from 'mongoose';

interface IVariant {
  size?: string;
  color?: string;
  sku: string;
  price: number;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  variants: IVariant[];
  basePrice: number;
  images: string[];
  storeId: mongoose.Types.ObjectId;
  isActive: boolean;
  barcode: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  size: { type: String },
  color: { type: String },
  sku: { type: String, required: [true, 'SKU is required'] },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  stock: { type: Number, default: 0, min: 0 },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    variants: [VariantSchema],
    basePrice: { type: Number, required: [true, 'Base price is required'], min: 0 },
    images: [{ type: String }],
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    isActive: { type: Boolean, default: true },
    barcode: { type: String, trim: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', category: 'text' });
ProductSchema.index({ storeId: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ barcode: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);