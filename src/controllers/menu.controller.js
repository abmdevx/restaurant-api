import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import MenuItem from "../models/menuItem.model.js";

// ── Create Menu Item (admin) ───────────────────────────────────────────────────
export const createMenuItem = asyncHandler(async (req, res) => {
  // TODO: Create a new menu item
  // 1. Destructure validated body (name, description, category, price)
  // 2. Save to DB
  // 3. Return created item
});

// ── Get All Menu Items ────────────────────────────────────────────────────────
export const getAllMenuItems = asyncHandler(async (req, res) => {
  // TODO: Return all menu items, optionally filtered by category & availability
  // Query params: ?category=main&isAvailable=true
});

// ── Get Menu Item by ID ───────────────────────────────────────────────────────
export const getMenuItemById = asyncHandler(async (req, res) => {
  // TODO: Return single menu item by req.params.id
});

// ── Update Menu Item (admin) ──────────────────────────────────────────────────
export const updateMenuItem = asyncHandler(async (req, res) => {
  // TODO: Update price, availability, description etc.
});

// ── Toggle Availability (admin) ───────────────────────────────────────────────
export const toggleMenuItemAvailability = asyncHandler(async (req, res) => {
  // TODO: Flip isAvailable boolean for a menu item
});

// ── Delete Menu Item (admin) ──────────────────────────────────────────────────
export const deleteMenuItem = asyncHandler(async (req, res) => {
  // TODO: Delete menu item by id
});
