import { Router } from "express";
import {
  registerUser,
  loginUser,
  changePassword,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteCurrentUser,
  deleteUser,
  bulkDeleteUsers
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema
} from "../validations/user.validation.js";

const router = Router();

// Public
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh-token", refreshAccessToken);

// Authenticated
router.patch("/change-password", verifyJWT, validate(changePasswordSchema), changePassword);
router.post("/logout", verifyJWT, logoutUser);
router.route("/me")
.get(verifyJWT, getCurrentUser)
.delete(verifyJWT, deleteCurrentUser);

// Admin only
router.get("/get-users", verifyJWT, verifyAdmin, getAllUsers);
router.patch("/update/:userId", verifyJWT, verifyAdmin, validate(updateUserSchema), updateUser);
router.delete("/bulk-delete", verifyJWT, verifyAdmin, bulkDeleteUsers);
router.delete("/delete/:userId", verifyJWT, verifyAdmin, deleteUser);

export default router;
