import { Router } from "express";
import {
  createTable,
  getAllTables,
  getTableById,
  updateTableStatus,
  checkTableAvailability,
  deleteTable,
} from "../controllers/table.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTableSchema,
  updateTableStatusSchema,
} from "../validations/table.validation.js";

const router = Router();

// All authenticated staff can view tables
router.get("/", verifyJWT, getAllTables);
router.get("/availability", verifyJWT, checkTableAvailability);
router.get("/:tableId", verifyJWT, getTableById);
router.patch("/:tableId/status", verifyJWT, validate(updateTableStatusSchema), updateTableStatus);

// Admin only
router.post("/", verifyJWT, verifyAdmin, validate(createTableSchema), createTable);
router.delete("/:tableId", verifyJWT, verifyAdmin, deleteTable);

export default router;
