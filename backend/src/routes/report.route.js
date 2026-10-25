import { Router } from "express";
import {
  getDailySalesReport,
  getRevenueReport,
  getTopSellingItems,
  getInventoryReport,
  getTableUtilisationReport,
} from "../controllers/report.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// All reports are admin-only
router.use(verifyJWT, verifyAdmin);

router.get("/daily-sales", getDailySalesReport);
router.get("/revenue", getRevenueReport);
router.get("/top-selling", getTopSellingItems);
router.get("/inventory", getInventoryReport);
router.get("/table-utilisation", getTableUtilisationReport);

export default router;
