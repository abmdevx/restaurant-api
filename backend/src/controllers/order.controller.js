import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Order from "../models/order.model.js";
import MenuItem from "../models/menuItem.model.js";
import Table from "../models/table.model.js";
import User from "../models/user.model.js";
import InventoryItem from "../models/inventoryItem.model.js";
import mongoose from "mongoose";

// ── Place Order ───────────────────────────────────────────────────────────────
// TODO: Place a new order for a table
// 1. Validate table exists and is occupied/reserved
// 2. Validate all menu item IDs exist and are available
// 3. Build items[] with price snapshots + subtotals
// 4. Calculate totalAmount
// 5. Save order, set table status to "occupied"
// 6. (Optional) Decrement inventory quantities
// 7. Return created order
export const placeOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { tableId, reservationId, items, notes, servedBy } = req.body;

    // Validate request
    if (!tableId) {
      throw new ApiError(400, "Table ID is required");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "At least one menu item is required");
    }

    // Find table
    const table = await Table.findById(tableId).session(session);

    if (!table) {
      throw new ApiError(404, "Table not found");
    }

    if (!["reserved", "occupied"].includes(table.status)) {
      throw new ApiError(
        400,
        "Table must be reserved or occupied before placing an order."
      );
    }

    // Prevent multiple active orders
    const existingOrder = await Order.findOne({
      table: table._id,
      status: { $in: ["pending", "preparing", "ready"] },
    }).session(session);

    if (existingOrder) {
      throw new ApiError(400, "This table already has an active order.");
    }

    const orderItems = [];

    // Process each menu item
    for (const item of items) {
      const menu = await MenuItem.findById(item.menuItem)
        .populate("ingredients.inventoryItem")
        .session(session);

      if (!menu) {
        throw new ApiError(404, "Menu item not found.");
      }

      if (!menu.isAvailable) {
        throw new ApiError(
          400,
          `${menu.name} is currently unavailable.`
        );
      }

      // Check inventory
      for (const ingredient of menu.ingredients) {
        const inventory = ingredient.inventoryItem;

        const requiredQty =
          ingredient.quantity * item.quantity;

        if (inventory.quantity < requiredQty) {
          throw new ApiError(
            400,
            `${inventory.name} is out of stock.`
          );
        }
      }

      // Deduct inventory
      for (const ingredient of menu.ingredients) {
        const inventory = ingredient.inventoryItem;

        const requiredQty =
          ingredient.quantity * item.quantity;

        inventory.quantity -= requiredQty;

        inventory.history.push({
          type: "deduction",
          quantity: requiredQty,
          reason: `Order for Table ${table.tableNumber}`,
        });

        await inventory.save({ session });
      }

      // Build snapshot
      orderItems.push({
        menuItem: menu._id,
        name: menu.name,
        quantity: item.quantity,
        unitPrice: menu.price,
        subtotal: menu.price * item.quantity,
        notes: item.notes,
      });
    }

    const servedByUser = await User.findById(servedBy || req.user._id).session(session);

    if (!servedByUser) {
      throw new ApiError(404, "Served by user not found.");
    }
    
    // Create order
    const order = new Order({
      table: table._id,
      reservation: reservationId,
      items: orderItems,
      notes,
      servedBy: servedByUser._id,
    });

    await order.save({ session });

    // Mark table occupied
    table.status = "occupied";
    await table.save({ session });

    await session.commitTransaction();

    return res.status(201).json(
      new ApiResponse(
        201,
        order,
        "Order placed successfully."
      )
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// ── Get All Orders ────────────────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  // TODO: Return orders filtered by status, table, date
  // Query params: ?status=pending&tableId=xxx&date=2024-12-25
  // Populate: table, items.menuItem

  const { status, tableId, date } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (tableId) {
    filter.table = tableId;
  }

  if (date) {
    const start = new Date(date);
    if (Number.isNaN(start.getTime())) {
      throw new ApiError(400, "Invalid order date");
    }
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
  }

  const orders = await Order.find(filter).populate("table", "tableNumber capacity location status").populate("items.menuItem", "name price");

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// ── Get Order by ID ───────────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  // TODO: Return single order with full population

  const order = await Order.findById(req.params.orderId).populate("table", "tableNumber capacity location status").populate("items.menuItem", "name price");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// ── Get Orders by Table ───────────────────────────────────────────────────────
export const getOrdersByTable = asyncHandler(async (req, res) => {
  // TODO: Return all orders for a specific table (current session)
  // req.params.id

  const orders = await Order.find({ table: req.params.tableId }).populate("table", "tableNumber capacity location status").populate("items.menuItem", "name price");

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// ── Update Order Status ───────────────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  // TODO: Change status: pending → preparing → ready → served
  // Kitchen staff update to "preparing", waiter updates to "served"

  const {status} = req.body

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = status;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// ── Add Items to Order ────────────────────────────────────────────────────────
// TODO: Push new items to an existing pending/preparing order
// Recalculate totalAmount
export const addItemsToOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "At least one item is required.");
    }

    const order = await Order.findById(req.params.orderId).session(session);

    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    if (!["pending", "preparing"].includes(order.status)) {
      throw new ApiError(
        400,
        "Items can only be added to pending or preparing orders."
      );
    }

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem)
        .populate("ingredients.inventoryItem")
        .session(session);

      if (!menuItem) {
        throw new ApiError(404, "Menu item not found.");
      }

      if (!menuItem.isAvailable) {
        throw new ApiError(
          400,
          `${menuItem.name} is currently unavailable.`
        );
      }

      // Check inventory
      for (const ingredient of menuItem.ingredients) {
        const inventory = ingredient.inventoryItem;

        const requiredQty = ingredient.quantity * item.quantity;

        if (inventory.quantity < requiredQty) {
          throw new ApiError(
            400,
            `${inventory.name} is out of stock.`
          );
        }
      }

      // Deduct inventory
      for (const ingredient of menuItem.ingredients) {
        const inventory = ingredient.inventoryItem;

        const requiredQty = ingredient.quantity * item.quantity;

        inventory.quantity -= requiredQty;

        inventory.history.push({
          type: "deduction",
          quantity: requiredQty,
          reason: `Additional items added to Order #${order._id}`,
        });

        await inventory.save({ session });
      }

      // Add snapshot to order
      order.items.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        subtotal: menuItem.price * item.quantity,
        notes: item.notes,
      });
    }

    await order.save({ session });

    await session.commitTransaction();

    return res.status(200).json(
      new ApiResponse(
        200,
        order,
        "Items added to order successfully."
      )
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// ── Process Payment ───────────────────────────────────────────────────────────
// TODO: Mark order paymentStatus as "paid", record paymentMethod
// Set table status back to "available"

export const processPayment = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      throw new ApiError(400, "Payment method is required.");
    }

    const order = await Order.findById(req.params.orderId).session(session);

    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    if (order.paymentStatus === "paid") {
      throw new ApiError(400, "Order has already been paid.");
    }

    if (!["cash", "card", "online"].includes(paymentMethod)) {
      throw new ApiError(400, "Invalid payment method.");
    }

    if (order.status === "cancelled"){
      throw new ApiError(
        400,
        "Cancelled orders cannot be paid."
      );
    }

    if (order.status !== "served") {
      throw new ApiError(
        400,
        "Only served orders can be paid."
      );
    }

    // Update payment
    order.paymentStatus = "paid";
    order.paymentMethod = paymentMethod;
    await order.save({ session });

    // Free the table
    const table = await Table.findById(order.table).session(session);

    if (table) {
      table.status = "available";
      await table.save({ session });
    }

    await session.commitTransaction();

    return res.status(200).json(
      new ApiResponse(200, order, "Payment processed successfully.")
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// ── Cancel Order ──────────────────────────────────────────────────────────────
// TODO: Cancel an order (only if status is "pending")
// Optionally restore inventory quantities

export const cancelOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = await Order.findById(req.params.orderId)
      .populate({
        path: "items.menuItem",
        populate: {
          path: "ingredients.inventoryItem",
        },
      })
      .session(session);

    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    if (order.status !== "pending") {
      throw new ApiError(
        400,
        "Only pending orders can be cancelled."
      );
    }

    // Restore inventory
    for (const item of order.items) {
      const menuItem = item.menuItem;

      for (const ingredient of menuItem.ingredients) {
        const inventory = ingredient.inventoryItem;

        const restoreQty = ingredient.quantity * item.quantity;

        inventory.quantity += restoreQty;

        inventory.history.push({
          type: "restock",
          quantity: restoreQty,
          reason: `Order #${order._id} cancelled`,
        });

        await inventory.save({ session });
      }
    }

    // Cancel order
    order.status = "cancelled";
    await order.save({ session });

    // Free table
    const table = await Table.findById(order.table).session(session);

    if (table) {
      table.status = "available";
      await table.save({ session });
    }

    await session.commitTransaction();

    return res.status(200).json(
      new ApiResponse(
        200,
        order,
        "Order cancelled successfully."
      )
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
