import mongoose, { model, Schema } from "mongoose";

/*
  Order tracks what a table has ordered in a session.
  items[] holds a snapshot of price at the time of ordering (important —
  menu prices may change later, but the order must keep the actual charged price).
*/

const orderItemSchema = new Schema(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: {
      // snapshot so historical orders remain accurate
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      // price at time of order
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    notes: {
      // e.g. "no onions"
      type: String,
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    table: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    reservation: {
      // optional – if order is linked to a reservation
      type: Schema.Types.ObjectId,
      ref: "Reservation",
    },

    items: [orderItemSchema],
    
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
    },
    servedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// TODO: Pre-save hook – calculate totalAmount from items[] subtotals
// TODO: Post-save hook – decrement inventory quantities for each item --> not optimized approach

orderSchema.pre("save", function (next) {

  if (!this.isModified("items")) return next();

  this.totalAmount = this.items.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  next();
});

export default model("Order", orderSchema);
