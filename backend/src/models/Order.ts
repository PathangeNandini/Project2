import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  storeId: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    variantSku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
  }[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'digital_wallet';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier ID is required'],
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: { type: String, required: true },
        variantSku: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0 },
        taxRate: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    totalDiscount: { type: Number, default: 0, min: 0 },
    totalTax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'digital_wallet'],
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Auto generate order number before saving
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

OrderSchema.index({ storeId: 1 });
OrderSchema.index({ cashierId: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);