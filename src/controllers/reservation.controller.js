import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Reservation from "../models/reservation.model.js";
import Table from "../models/table.model.js";

// ── Create Reservation ────────────────────────────────────────────────────────
export const createReservation = asyncHandler(async (req, res) => {
  // TODO: Book a table for a customer
  // 1. Validate table exists and has enough capacity
  // 2. Check no conflicting reservation on same table/date
  // 3. Set table status to "reserved"
  // 4. Create reservation record
  // 5. Return confirmation
});

// ── Get All Reservations ──────────────────────────────────────────────────────
export const getAllReservations = asyncHandler(async (req, res) => {
  // TODO: Return reservations, filter by date or status
  // Query params: ?date=2024-12-25&status=confirmed
  // Populate: table, handledBy
});

// ── Get Reservation by ID ─────────────────────────────────────────────────────
export const getReservationById = asyncHandler(async (req, res) => {
  // TODO: Return single reservation populated with table info
});

// ── Update Reservation ────────────────────────────────────────────────────────
export const updateReservation = asyncHandler(async (req, res) => {
  // TODO: Update date, partySize, notes, or reassign table
  // Re-check availability if table or date changes
});

// ── Confirm Reservation ───────────────────────────────────────────────────────
export const confirmReservation = asyncHandler(async (req, res) => {
  // TODO: Change status from "pending" → "confirmed"
});

// ── Cancel Reservation ────────────────────────────────────────────────────────
export const cancelReservation = asyncHandler(async (req, res) => {
  // TODO: Set status to "cancelled"
  // Free up the table (set table status back to "available" if no other bookings)
});
