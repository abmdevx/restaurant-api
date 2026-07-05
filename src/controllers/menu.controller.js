import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import MenuItem from "../models/menuItem.model.js";

// ── Create Menu Item (admin) ───────────────────────────────────────────────────
export const createMenuItem = asyncHandler(async (req, res) => {
  // TODO: Create a new menu item
  // 1. Destructure validated body (name, description, category, price)
  // 2. Save to DB
  // 3. Return created item.

  const { name, description, category, price } = req.body;

  const menuItem = await MenuItem.create({
    name,
    description,
    category,
    price,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, menuItem, "Menu item created successfully"));
});

// ── Get All Menu Items ────────────────────────────────────────────────────────
export const getAllMenuItems = asyncHandler(async (req, res) => {
  // TODO: Return all menu items, optionally filtered by category & availability
  // Query params: ?category=main&isAvailable=true

  const { category, isAvailable } = req.query;

  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (isAvailable === "true") {
    filter.isAvailable = true;
  }

  const menuItems = await MenuItem.find(filter);

  return res
    .status(200)
    .json(new ApiResponse(200, menuItems, "Menu items fetched successfully"));
});

// ── Get Menu Item by ID ───────────────────────────────────────────────────────
export const getMenuItemById = asyncHandler(async (req, res) => {
  // TODO: Return single menu item by req.params.id

  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, menuItem, "Menu item fetched successfully"));
});

// ── Update Menu Item (admin) ──────────────────────────────────────────────────
export const updateMenuItem = asyncHandler(async (req, res) => {
  // TODO: Update price, availability, description etc.

  const { name, description, category, price } = req.body;

  const menuItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { name, description, category, price },
    { new: true }
  );

  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, menuItem, "Menu item updated successfully"));
});

// ── Toggle Availability (admin) ───────────────────────────────────────────────
export const toggleMenuItemAvailability = asyncHandler(async (req, res) => {
  // TODO: Flip isAvailable boolean for a menu item

  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  menuItem.isAvailable = !menuItem.isAvailable;
  await menuItem.save();

  return res
    .status(200)
    .json(new ApiResponse(200, menuItem, "Menu item availability toggled"));
});

// ── Delete Menu Item (admin) ──────────────────────────────────────────────────
export const deleteMenuItem = asyncHandler(async (req, res) => {
  // TODO: Delete menu item by id

  const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, menuItem, "Menu item deleted successfully"));
});

// ── Delete All Menu Items (admin) ─────────────────────────────────────────────
export const deleteMenuItems = asyncHandler(async (req, res) => {
  // TODO: Delete all menu items

  const result = await MenuItem.deleteMany({});

  return res
    .status(200)
    .json(new ApiResponse(200, result, "All menu items deleted successfully"));
});

// ── Delete Menu Items By IDs ─────────────────────────────────────────────
export const deleteMenuItemsByIds = asyncHandler(async (req, res) => {
  // TODO: Delete menu items by an array of IDs

  const { ids } = req.body;

  const result = await MenuItem.deleteMany({ _id: { $in: ids } });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Selected menu items deleted successfully"));
});
