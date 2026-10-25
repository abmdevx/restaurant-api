import { Router } from "express";
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
  deleteMenuItems,
  deleteMenuItemsByIds,
} from "../controllers/menu.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  deleteAllMenuItemsSchema,
  deleteMenuItemsByIdsSchema,
} from "../validations/menu.validation.js";

const router = Router();

// Public – anyone can view the menu
router.get("/all-menu", getAllMenuItems);
router.get("/menu-item/:id", getMenuItemById);

// Admin only
router.post("/create", verifyJWT, verifyAdmin, validate(createMenuItemSchema), createMenuItem);
router.patch("/update/:id", verifyJWT, verifyAdmin, validate(updateMenuItemSchema), updateMenuItem);
router.patch("/toggle-availability/:id", verifyJWT, verifyAdmin, toggleMenuItemAvailability);
router.delete("/delete/:id", verifyJWT, verifyAdmin, deleteMenuItem);
router.delete("/delete-all", verifyJWT, verifyAdmin, validate(deleteAllMenuItemsSchema), deleteMenuItems);
router.delete("/delete-by-ids", verifyJWT, verifyAdmin, validate(deleteMenuItemsByIdsSchema), deleteMenuItemsByIds);

export default router;
