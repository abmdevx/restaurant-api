import { Router } from "express";
import {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrdersByTable,
  updateOrderStatus,
  addItemsToOrder,
  processPayment,
  cancelOrder,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  placeOrderSchema,
  updateOrderStatusSchema,
  addItemsSchema,
  processPaymentSchema,
} from "../validations/order.validation.js";

const router = Router();

// All authenticated staff
router.post("/", verifyJWT, validate(placeOrderSchema), placeOrder);
router.get("/", verifyJWT, getAllOrders);
router.get("/table/:tableId", verifyJWT, getOrdersByTable);
router.get("/:orderId", verifyJWT, getOrderById);
router.patch("/:orderId/status", verifyJWT, validate(updateOrderStatusSchema), updateOrderStatus);
router.patch("/:orderId/add-items", verifyJWT, validate(addItemsSchema), addItemsToOrder);
router.patch("/:orderId/payment", verifyJWT, validate(processPaymentSchema), processPayment);
router.patch("/:orderId/cancel", verifyJWT, cancelOrder);

export default router;
