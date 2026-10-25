import mongoose, { model, Schema } from "mongoose";

/*
  InventoryItem tracks raw ingredients / stock.
  lowStockThreshold triggers alerts when quantity falls below it.
*/
const inventoryItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["produce", "meat", "dairy", "beverage", "dry-goods", "other"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      // e.g. "kg", "litre", "pieces"
      type: String,
      required: true,
      trim: true,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      default: 10,
    },
    costPerUnit: {
      type: Number,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    history: [
      {
         type: {
          type: String,
          enum: ["restock", "deduction"],
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        reason: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// What is a Virtual?

// A virtual is not stored in MongoDB.

// It is calculated dynamically whenever you access the document.

// Virtual: is stock low?
inventoryItemSchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.lowStockThreshold;
});

inventoryItemSchema.set("toJSON", { virtuals: true });

export default model("InventoryItem", inventoryItemSchema);
