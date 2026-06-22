const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    barcode: { type: String, trim: true },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    brand: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, trim: true },
    variants: [variantSchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", category: "text", description: "text" });
productSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);