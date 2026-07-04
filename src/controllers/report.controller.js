import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Order from "../models/order.model.js";
import InventoryItem from "../models/inventoryItem.model.js";

// ── Daily Sales Report ────────────────────────────────────────────────────────
export const getDailySalesReport = asyncHandler(async (req, res) => {
  // TODO: Aggregate orders for a given date
  // Query params: ?date=2024-12-25
  // Return: totalRevenue, totalOrders, averageOrderValue, topSellingItems[]
  // Hint: Use MongoDB $match (date range) + $group aggregation
});

// ── Revenue Report (date range) ───────────────────────────────────────────────
export const getRevenueReport = asyncHandler(async (req, res) => {
  // TODO: Summarise revenue between startDate and endDate
  // Query params: ?startDate=2024-12-01&endDate=2024-12-31
  // Return: daily breakdown + grand totals
});

// ── Top Selling Items ─────────────────────────────────────────────────────────
export const getTopSellingItems = asyncHandler(async (req, res) => {
  // TODO: Aggregate order items to find most ordered menu items
  // Query params: ?limit=10&startDate=...&endDate=...
});

// ── Inventory Usage Report ────────────────────────────────────────────────────
export const getInventoryReport = asyncHandler(async (req, res) => {
  // TODO: Return current stock levels + items below threshold
  // Useful for daily kitchen briefing
});

// ── Table Utilisation Report ──────────────────────────────────────────────────
export const getTableUtilisationReport = asyncHandler(async (req, res) => {
  // TODO: How many times each table was used in a date range
  // Helps identify busy / idle tables
});
