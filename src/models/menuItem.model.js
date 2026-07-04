import mongoose, { model, Schema } from "mongoose";

/*
  MenuItems represent dishes / drinks on the restaurant menu.
  Each item links to an InventoryItem for stock tracking (optional).
*/
const menuItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["starter", "main", "dessert", "beverage", "side"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // TODO: Add ingredients array linking to InventoryItem for auto-decrement
    // ingredients: [{ item: { type: Schema.Types.ObjectId, ref: "InventoryItem" }, quantity: Number }]
  },
  { timestamps: true }
);

export default model("MenuItem", menuItemSchema);
