import mongoose, { Document, Schema, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'cashier' | 'manager' | 'admin';
  storeId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['cashier', 'manager', 'admin'],
      default: 'cashier',
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', function (next) {
  if (!this.isModified('passwordHash')) {
    next();
    return;
  }
  bcrypt.hash(this.passwordHash, 12)
    .then((hash: string) => {
      this.passwordHash = hash;
      next();
    })
    .catch((err: Error) => {
      next(err);
    });
});

UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.index({ storeId: 1 });

export default mongoose.model<IUser>('User', UserSchema);