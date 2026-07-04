import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Order from "../models/order.model.js";
import MenuItem from "../models/menuItem.model.js";
import Table from "../models/table.model.js";

// ── Place Order ───────────────────────────────────────────────────────────────
export const placeOrder = asyncHandler(async (req, res) => {
  // TODO: Place a new order for a table
  // 1. Validate table exists and is occupied/reserved
  // 2. Validate all menu item IDs exist and are available
  // 3. Build items[] with price snapshots + subtotals
  // 4. Calculate totalAmount
  // 5. Save order, set table status to "occupied"
  // 6. (Optional) Decrement inventory quantities
  // 7. Return created order
});

// ── Get All Orders ────────────────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  // TODO: Return orders filtered by status, table, date
  // Query params: ?status=pending&tableId=xxx&date=2024-12-25
  // Populate: table, items.menuItem, servedBy
});

// ── Get Order by ID ───────────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  // TODO: Return single order with full population
});

// ── Get Orders by Table ───────────────────────────────────────────────────────
export const getOrdersByTable = asyncHandler(async (req, res) => {
  // TODO: Return all orders for a specific table (current session)
  // req.params.tableId
});

// ── Update Order Status ───────────────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  // TODO: Change status: pending → preparing → ready → served
  // Kitchen staff update to "preparing", waiter updates to "served"
});

// ── Add Items to Order ────────────────────────────────────────────────────────
export const addItemsToOrder = asyncHandler(async (req, res) => {
  // TODO: Push new items to an existing pending/preparing order
  // Recalculate totalAmount
});

// ── Process Payment ───────────────────────────────────────────────────────────
export const processPayment = asyncHandler(async (req, res) => {
  // TODO: Mark order paymentStatus as "paid", record paymentMethod
  // Set table status back to "available"
});

// ── Cancel Order ──────────────────────────────────────────────────────────────
export const cancelOrder = asyncHandler(async (req, res) => {
  // TODO: Cancel an order (only if status is "pending")
  // Optionally restore inventory quantities
});
