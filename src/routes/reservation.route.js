import { Router } from "express";
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  confirmReservation,
  cancelReservation,
} from "../controllers/reservation.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createReservationSchema,
  updateReservationSchema,
} from "../validations/reservation.validation.js";

const router = Router();

// All authenticated staff
router.post("/", verifyJWT, validate(createReservationSchema), createReservation);
router.get("/", verifyJWT, getAllReservations);
router.get("/:reservationId", verifyJWT, getReservationById);
router.patch("/:reservationId", verifyJWT, validate(updateReservationSchema), updateReservation);
router.patch("/:reservationId/confirm", verifyJWT, confirmReservation);
router.patch("/:reservationId/cancel", verifyJWT, cancelReservation);

export default router;
