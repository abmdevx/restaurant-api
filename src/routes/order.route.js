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
router.post("/create", verifyJWT, validate(placeOrderSchema), placeOrder);
router.get("/get-all", verifyJWT, getAllOrders);
router.get("/table-order/:tableId", verifyJWT, getOrdersByTable);
router.get("/get-order/:orderId", verifyJWT, getOrderById);
router.patch("/update-status/:orderId", verifyJWT, validate(updateOrderStatusSchema), updateOrderStatus);
router.patch("/add-items/:orderId", verifyJWT, validate(addItemsSchema), addItemsToOrder);
router.patch("/process-payment/:orderId", verifyJWT, validate(processPaymentSchema), processPayment);
router.patch("/cancel/:orderId", verifyJWT, cancelOrder);

export default router;
