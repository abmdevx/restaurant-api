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
router.post("/create", verifyJWT, validate(createReservationSchema), createReservation);
router.get("/all-reservations", verifyJWT, getAllReservations);
router.get("/get-reservation/:reservationId", verifyJWT, getReservationById);
router.patch("/update/:reservationId", verifyJWT, validate(updateReservationSchema), updateReservation);
router.patch("/confirm/:reservationId", verifyJWT, confirmReservation);
router.patch("/cancel/:reservationId", verifyJWT, cancelReservation);

export default router;
