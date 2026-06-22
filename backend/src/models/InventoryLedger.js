const mongoose = require("mongoose");

const inventoryLedgerSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    changeType: {
      type: String,
      enum: ["sale", "restock", "transfer", "adjustment"],
      required: true
    },
    quantityDelta: { type: Number, required: true },
    note: String,
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

inventoryLedgerSchema.index({ product: 1, store: 1, createdAt: -1 });

module.exports = mongoose.model("InventoryLedger", inventoryLedgerSchema);