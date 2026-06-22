const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    storeId: {
      type: String,
      required: true,
      trim: true
    },
    onHand: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    reorderPoint: {
      type: Number,
      default: 5,
      min: 0
    }
  },
  { timestamps: true }
);

inventorySchema.index({ product: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);