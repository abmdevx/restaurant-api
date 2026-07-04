import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Table from "../models/table.model.js";

// ── Create Table (admin) ──────────────────────────────────────────────────────
export const createTable = asyncHandler(async (req, res) => {
  // TODO: Add a new table (tableNumber, capacity, location)
});

// ── Get All Tables ────────────────────────────────────────────────────────────
export const getAllTables = asyncHandler(async (req, res) => {
  // TODO: Return all tables, optionally filtered by status
  // Query params: ?status=available
});

// ── Get Table by ID ───────────────────────────────────────────────────────────
export const getTableById = asyncHandler(async (req, res) => {
  // TODO: Return single table
});

// ── Update Table Status ───────────────────────────────────────────────────────
export const updateTableStatus = asyncHandler(async (req, res) => {
  // TODO: Change status: available | occupied | reserved | maintenance
  // Useful when staff mark a table as occupied on walk-in
});

// ── Check Table Availability ──────────────────────────────────────────────────
export const checkTableAvailability = asyncHandler(async (req, res) => {
  // TODO: Given a date + party size, return available tables
  // Checks for conflicting reservations on that date/time
  // Query params: ?date=2024-12-25T19:00:00&partySize=4
});

// ── Delete Table (admin) ──────────────────────────────────────────────────────
export const deleteTable = asyncHandler(async (req, res) => {
  // TODO: Remove a table from the system
});
