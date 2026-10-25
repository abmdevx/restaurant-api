import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Order from "../models/order.model.js";
import InventoryItem from "../models/inventoryItem.model.js";

const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new ApiError(400, "Invalid date range");
  }

  end.setDate(end.getDate() + 1);
  return { start, end };
};

// ── Daily Sales Report ────────────────────────────────────────────────────────
export const getDailySalesReport = asyncHandler(async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const { start, end } = getDateRange(date, date);

  const [summary] = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, paymentStatus: "paid", status: { $ne: "cancelled" } } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 }, averageOrderValue: { $avg: "$totalAmount" } } },
  ]);

  const topSellingItems = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.menuItem", quantity: { $sum: "$items.quantity" }, revenue: { $sum: "$items.subtotal" }, name: { $first: "$items.name" } } },
    { $sort: { quantity: -1 } },
  ]);

  return res.json(new ApiResponse(200, { totalRevenue: summary?.totalRevenue || 0, totalOrders: summary?.totalOrders || 0, averageOrderValue: summary?.averageOrderValue || 0, topSellingItems }, "Daily sales report fetched successfully"));
});

// ── Revenue Report (date range) ───────────────────────────────────────────────
export const getRevenueReport = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.startDate, req.query.endDate);

  const report = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, paymentStatus: "paid", status: { $ne: "cancelled" } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const totals = report.reduce((result, day) => ({ revenue: result.revenue + day.revenue, orders: result.orders + day.orders }), { revenue: 0, orders: 0 });

  return res.json(new ApiResponse(200, { startDate: start, endDate: end, daily: report, totals }, "Revenue report fetched successfully"));
});

// ── Top Selling Items ─────────────────────────────────────────────────────────
export const getTopSellingItems = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const startDate = req.query.startDate || new Date(0).toISOString();
  const endDate = req.query.endDate || new Date().toISOString();
  const { start, end } = getDateRange(startDate, endDate);

  const items = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.menuItem", name: { $first: "$items.name" }, quantity: { $sum: "$items.quantity" }, revenue: { $sum: "$items.subtotal" } } },
    { $sort: { quantity: -1 } },
    { $limit: limit },
  ]);

  return res.json(new ApiResponse(200, items, "Top-selling items fetched successfully"));
});

// ── Inventory Usage Report ────────────────────────────────────────────────────
export const getInventoryReport = asyncHandler(async (req, res) => {
  const items = await InventoryItem.find({}).sort({ quantity: 1 });

  return res.json(new ApiResponse(200, { items, lowStock: items.filter((item) => item.quantity <= item.lowStockThreshold) }, "Inventory report fetched successfully"));
});

// ── Table Utilisation Report ──────────────────────────────────────────────────
export const getTableUtilisationReport = asyncHandler(async (req, res) => {
  const startDate = req.query.startDate || new Date(0).toISOString();
  const endDate = req.query.endDate || new Date().toISOString();
  const { start, end } = getDateRange(startDate, endDate);

  const usage = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, status: { $ne: "cancelled" } } },
    { $group: { _id: "$table", orders: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
    { $lookup: { from: "tables", localField: "_id", foreignField: "_id", as: "table" } },
    { $unwind: { path: "$table", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, tableId: "$_id", tableNumber: "$table.tableNumber", orders: 1, revenue: 1 } },
    { $sort: { orders: -1 } },
  ]);
  
  return res.json(new ApiResponse(200, usage, "Table utilisation report fetched successfully"));
});
