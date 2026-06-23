import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  timezone: string;
  isActive: boolean;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Store email is required'],
      lowercase: true,
      trim: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    taxRate: {
      type: Number,
      default: 18,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast name search
StoreSchema.index({ name: 1 });
StoreSchema.index({ isActive: 1 });

export default mongoose.model<IStore>('Store', StoreSchema);