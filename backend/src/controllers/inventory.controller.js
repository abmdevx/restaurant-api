import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import InventoryItem from "../models/inventoryItem.model.js";

// ── Add Inventory Item (admin) ────────────────────────────────────────────────
export const addInventoryItem = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    quantity,
    unit,
    lowStockThreshold,
    costPerUnit,
    supplier,
  } = req.body;

  const existingItem = await InventoryItem.findOne({ name });

  if (existingItem) {
    throw new ApiError(400, "Inventory item with this name already exists");
  }

  const inventoryItem = await InventoryItem.create({
    name,
    category,
    quantity,
    unit,
    lowStockThreshold: lowStockThreshold ?? 10,
    costPerUnit,
    supplier,
    history:
      quantity > 0
        ? [
            {
              type: "restock",
              quantity,
              reason: "Initial Stock",
              createdAt: new Date(),
            },
          ]
        : [],
  });

  return res.status(201).json(
    new ApiResponse(201, inventoryItem, "Inventory item added successfully")
  );
});

// ── Get All Inventory ─────────────────────────────────────────────────────────
export const getAllInventory = asyncHandler(async (req, res) => {
  const { category, lowStock } = req.query;

  const filter = {};

  if (category && category !== "all") {
    filter.category = category;
  }

  if (lowStock === "true") {
    filter.$expr = {
      $lte: ["$quantity", "$lowStockThreshold"],
    };
  }

  const inventoryItems = await InventoryItem.find(filter).sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(200, inventoryItems, "Inventory fetched successfully")
  );
});

// ── Get Inventory Item by ID ──────────────────────────────────────────────────
export const getInventoryItemById = asyncHandler(async (req, res) => {
  const inventoryItem = await InventoryItem.findById(req.params.id);

  if (!inventoryItem) {
    throw new ApiError(404, "Inventory item not found");
  }

  return res.status(200).json(
    new ApiResponse(200, inventoryItem, "Inventory item fetched successfully")
  );
});

// ── Update Inventory Item ─────────────────────────────────────────────────────
export const updateInventoryItem = asyncHandler(async (req, res) => {
  const { name, category, unit, supplier, costPerUnit, lowStockThreshold } = req.body;

  if (name) {
    const existingItem = await InventoryItem.findOne({
      name,
      _id: { $ne: req.params.id },
    });

    if (existingItem) {
      throw new ApiError(400, "Inventory item with this name already exists");
    }
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (category !== undefined) updateData.category = category;
  if (unit !== undefined) updateData.unit = unit;
  if (supplier !== undefined) updateData.supplier = supplier;
  if (costPerUnit !== undefined) updateData.costPerUnit = costPerUnit;
  if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;

  const inventoryItem = await InventoryItem.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!inventoryItem) {
    throw new ApiError(404, "Inventory item not found");
  }

  return res.status(200).json(
    new ApiResponse(200, inventoryItem, "Inventory item updated successfully")
  );
});

// ── Restock Inventory ─────────────────────────────────────────────────────────
export const restockInventory = asyncHandler(async (req, res) => {
  const { quantity, reason } = req.body;

  const inventoryItem = await InventoryItem.findByIdAndUpdate(
    req.params.id,
    {
      $inc: {
        quantity,
      },
      $push: {
        history: {
          type: "restock",
          quantity,
          reason: reason || "Manual Restock",
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!inventoryItem) {
    throw new ApiError(404, "Inventory item not found");
  }

  return res.status(200).json(
    new ApiResponse(200, inventoryItem, "Inventory item restocked successfully")
  );
});

// ── Deduct Inventory ──────────────────────────────────────────────────────────
export const deductInventory = asyncHandler(async (req, res) => {
  const { quantity, reason } = req.body;

  const existingItem = await InventoryItem.findById(req.params.id);

  if (!existingItem) {
    throw new ApiError(404, "Inventory item not found");
  }

  if (existingItem.quantity < quantity) {
    throw new ApiError(400, "Insufficient inventory quantity");
  }

  const inventoryItem = await InventoryItem.findByIdAndUpdate(
    req.params.id,
    {
      $inc: {
        quantity: -quantity,
      },
      $push: {
        history: {
          type: "deduction",
          quantity,
          reason: reason || "Manual Deduction",
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return res.status(200).json(
    new ApiResponse(200, inventoryItem, "Inventory deducted successfully")
  );
});

// ── Get Low Stock Alerts ──────────────────────────────────────────────────────
export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const inventoryItems = await InventoryItem.find({
    $expr: {
      $lte: ["$quantity", "$lowStockThreshold"],
    },
  });

  return res.status(200).json(
    new ApiResponse(200, inventoryItems, "Low stock alerts fetched successfully")
  );
});

// ── Delete Inventory Item ─────────────────────────────────────────────────────
export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const inventoryItem = await InventoryItem.findByIdAndDelete(req.params.id);

  if (!inventoryItem) {
    throw new ApiError(404, "Inventory item not found");
  }

  return res.status(200).json(
    new ApiResponse(200, inventoryItem, "Inventory item deleted successfully")
  );
});

// ── Delete All Inventory Items ────────────────────────────────────────────────
export const deleteInventoryItems = asyncHandler(async (req, res) => {
  const result = await InventoryItem.deleteMany({});

  return res.status(200).json(
    new ApiResponse(200, result, "All inventory items deleted successfully")
  );
});

// ── Delete Inventory Items By IDs ─────────────────────────────────────────────
export const deleteInventoryItemsByIds = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const result = await InventoryItem.deleteMany({
    _id: { $in: ids },
  });

  return res.status(200).json(
    new ApiResponse(200, result, "Selected inventory items deleted successfully")
  );
});