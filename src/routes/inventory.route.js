import { Router } from "express";
import {
  addInventoryItem,
  getAllInventory,
  getInventoryItemById,
  updateInventoryItem,
  restockInventory,
  deductInventory,
  getLowStockAlerts,
  deleteInventoryItem,
} from "../controllers/inventory.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  addInventoryItemSchema,
  updateInventoryItemSchema,
  restockSchema,
  deductSchema,
} from "../validations/inventory.validation.js";

const router = Router();

// Staff can view inventory and see alerts
router.get("/", verifyJWT, getAllInventory);
router.get("/low-stock", verifyJWT, getLowStockAlerts);
router.get("/:itemId", verifyJWT, getInventoryItemById);

// Admin-level mutations
router.post("/", verifyJWT, verifyAdmin, validate(addInventoryItemSchema), addInventoryItem);
router.patch("/:itemId", verifyJWT, verifyAdmin, validate(updateInventoryItemSchema), updateInventoryItem);
router.patch("/:itemId/restock", verifyJWT, verifyAdmin, validate(restockSchema), restockInventory);
router.patch("/:itemId/deduct", verifyJWT, verifyAdmin, validate(deductSchema), deductInventory);
router.delete("/:itemId", verifyJWT, verifyAdmin, deleteInventoryItem);

export default router;
