import mongoose, { model, Schema } from "mongoose";

/*
  Table represents a physical table in the restaurant.
  status drives availability logic for reservations & walk-ins.
*/
const tableSchema = new Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "maintenance"],
      default: "available",
    },
    location: {
      // e.g. "indoor", "outdoor", "rooftop"
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default model("Table", tableSchema);
