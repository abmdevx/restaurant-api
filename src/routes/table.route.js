import { Router } from "express";
import {
  createTable,
  getAllTables,
  getTableById,
  updateTableStatus,
  checkTableAvailability,
  deleteTable,
  deleteAllTables,
  deleteTablesByIds
} from "../controllers/table.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTableSchema,
  updateTableStatusSchema,
  deleteAllTablesSchema,
  deleteTablesByIdsSchema
} from "../validations/table.validation.js";

const router = Router();

// All authenticated staff can view tables
router.get("/all-tables", verifyJWT, getAllTables);
router.get("/availability", verifyJWT, checkTableAvailability);
router.get("/get-table/:tableId", verifyJWT, getTableById);
router.patch("/status/:tableId", verifyJWT, validate(updateTableStatusSchema), updateTableStatus);

// Admin only
router.post("/create", verifyJWT, verifyAdmin, validate(createTableSchema), createTable);
router.delete("/delete/:tableId", verifyJWT, verifyAdmin, deleteTable);
router.delete("/delete-all", verifyJWT, verifyAdmin, validate(deleteAllTablesSchema), deleteAllTables);
router.delete("/delete-by-ids", verifyJWT, verifyAdmin, validate(deleteTablesByIdsSchema), deleteTablesByIds);

export default router;
