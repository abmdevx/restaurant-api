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
  deleteInventoryItems,
  deleteInventoryItemsByIds
} from "../controllers/inventory.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  addInventoryItemSchema,
  updateInventoryItemSchema,
  restockSchema,
  deductSchema,
  deleteAllInventorySchema,
  deleteInventoryItemsByIdsSchema
} from "../validations/inventory.validation.js";

const router = Router();

// Staff can view inventory and see alerts
router.get("/all-items", verifyJWT, getAllInventory);
router.get("/low-stock", verifyJWT, getLowStockAlerts);
router.get("/item/:id", verifyJWT, getInventoryItemById);

// Admin-level mutations
router.post("/add-item", verifyJWT, verifyAdmin, validate(addInventoryItemSchema), addInventoryItem);
router.patch("/update/:id", verifyJWT, verifyAdmin, validate(updateInventoryItemSchema), updateInventoryItem);
router.patch("/restock/:id", verifyJWT, verifyAdmin, validate(restockSchema), restockInventory);
router.patch("/deduct/:id", verifyJWT, verifyAdmin, validate(deductSchema), deductInventory);
router.delete("/delete/:id", verifyJWT, verifyAdmin, deleteInventoryItem);
router.delete("/delete-all", verifyJWT, verifyAdmin, validate(deleteAllInventorySchema), deleteInventoryItems);
router.delete("/delete-by-ids", verifyJWT, verifyAdmin, validate(deleteInventoryItemsByIdsSchema), deleteInventoryItemsByIds);

export default router;
