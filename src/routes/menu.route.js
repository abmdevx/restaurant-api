import { Router } from "express";
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
} from "../controllers/menu.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "../validations/menu.validation.js";

const router = Router();

// Public – anyone can view the menu
router.get("/", getAllMenuItems);
router.get("/:itemId", getMenuItemById);

// Admin only
router.post("/", verifyJWT, verifyAdmin, validate(createMenuItemSchema), createMenuItem);
router.patch("/:itemId", verifyJWT, verifyAdmin, validate(updateMenuItemSchema), updateMenuItem);
router.patch("/:itemId/toggle-availability", verifyJWT, verifyAdmin, toggleMenuItemAvailability);
router.delete("/:itemId", verifyJWT, verifyAdmin, deleteMenuItem);

export default router;
