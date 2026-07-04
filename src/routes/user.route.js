import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
} from "../validations/user.validation.js";

const router = Router();

// Public
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh-token", refreshAccessToken);

// Authenticated
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);

// Admin only
router.get("/", verifyJWT, verifyAdmin, getAllUsers);
router.patch("/:userId", verifyJWT, verifyAdmin, validate(updateUserSchema), updateUser);
router.delete("/:userId", verifyJWT, verifyAdmin, deleteUser);

export default router;
