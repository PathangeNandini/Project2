import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryLedger extends Document {
  productId: mongoose.Types.ObjectId;
  variantSku: string;
  storeId: mongoose.Types.ObjectId;
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryLedgerSchema = new Schema<IInventoryLedger>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    variantSku: {
      type: String,
      required: [true, 'Variant SKU is required'],
      trim: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup by product + store + sku
InventoryLedgerSchema.index({ productId: 1, storeId: 1, variantSku: 1 }, { unique: true });
InventoryLedgerSchema.index({ storeId: 1 });
InventoryLedgerSchema.index({ quantity: 1 });

// Virtual for available stock
InventoryLedgerSchema.virtual('availableStock').get(function () {
  return this.quantity - this.reserved;
});

// Virtual for low stock alert
InventoryLedgerSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

export default mongoose.model<IInventoryLedger>(
  'InventoryLedger',
  InventoryLedgerSchema
);