import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Table from "../models/table.model.js";

// ── Create Table (admin) ──────────────────────────────────────────────────────
export const createTable = asyncHandler(async (req, res) => {
  // TODO: Add a new table (tableNumber, capacity, location)

  const { tableNumber, capacity, location } = req.body;

  const table = await Table.create({
    tableNumber,
    capacity,
    location,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, table, "Table created successfully"));
});

// ── Get All Tables ────────────────────────────────────────────────────────────
export const getAllTables = asyncHandler(async (req, res) => {
  // TODO: Return all tables, optionally filtered by status
  // Query params: ?status=available

  const { status } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  const tables = await Table.find(filter);

  return res
    .status(200)
    .json(new ApiResponse(200, tables, "Tables fetched successfully"));
});

// ── Get Table by ID ───────────────────────────────────────────────────────────
export const getTableById = asyncHandler(async (req, res) => {
  // TODO: Return single table

  const table = await Table.findById(req.params.id);

  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, table, "Table fetched successfully"));
});

// ── Update Table Status ───────────────────────────────────────────────────────
export const updateTableStatus = asyncHandler(async (req, res) => {
  // TODO: Change status: available | occupied | reserved | maintenance
  // Useful when staff mark a table as occupied on walk-in

  const { status } = req.body;

  const table = await Table.findById(req.params.id);

  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  table.status = status;
  await table.save();

  return res
    .status(200)
    .json(new ApiResponse(200, table, "Table status updated successfully"));
});

// ── Check Table Availability ──────────────────────────────────────────────────
export const checkTableAvailability = asyncHandler(async (req, res) => {
  // TODO: Given a date + party size, return available tables
  // Checks for conflicting reservations on that date/time
  // Query params: ?date=2024-12-25T19:00:00&partySize=4

  const { date, partySize } = req.query;

  const tables = await Table.find({
    status: "available",
    capacity: { $gte: partySize },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tables, "Tables fetched successfully"));
});

// ── Delete Table (admin) ──────────────────────────────────────────────────────
export const deleteTable = asyncHandler(async (req, res) => {
  // TODO: Remove a table from the system

  const table = await Table.findByIdAndDelete(req.params.id);

  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, table, "Table deleted successfully"));
});

// ── Delete all Tables (admin) ──────────────────────────────────────────────────────
export const deleteAllTables = asyncHandler(async (req, res) => {
  // TODO: Remove all tables from the system

  const tables = await Table.deleteMany({});

  return res
    .status(200)
    .json(new ApiResponse(200, tables, "All tables deleted successfully"));
});

// ── Delete Tables By IDs (admin) ──────────────────────────────────────────────
export const deleteTablesByIds = asyncHandler(async (req, res) => {
  // TODO: Remove tables by an array of IDs

  const { ids } = req.body;

  const result = await Table.deleteMany({
    _id: { $in: ids },
  });

  return res.status(200).json(
    new ApiResponse(200, result, "Selected tables deleted successfully")
  );
});