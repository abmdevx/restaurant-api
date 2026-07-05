import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Reservation from "../models/reservation.model.js";
import Table from "../models/table.model.js";
import User from "../models/user.model.js";

// ── Create Reservation ────────────────────────────────────────────────────────
export const createReservation = asyncHandler(async (req, res) => {
  // TODO: Book a table for a customer
  // 1. Validate table exists and has enough capacity
  // 2. Check no conflicting reservation on same table/date
  // 3. Set table status to "reserved"
  // 4. Create reservation record
  // 5. Return confirmation

  const { customerName, customerPhone, customerEmail, tableId, date, partySize, notes, handledBy } = req.body;

  const table = await Table.findById(tableId);

  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  if (table.status !== "available") {
    throw new ApiError(400, "Table is not available");
  }

  if (table.capacity < partySize) {
    throw new ApiError(400, "Table does not have enough capacity");
  }

  const conflictingReservation = await Reservation.findOne({
    table: tableId,
    date,
  });

  if (conflictingReservation) {
    throw new ApiError(400, "Table is already reserved");
  }

  table.status = "confirmed";
  await table.save();

  const handledByUser = await User.findById(handledBy);

  if (!handledByUser) {
    throw new ApiError(404, "User not found");
  }

  if (handledByUser.role !== "staff") {
    throw new ApiError(400, "User is not a staff member");
  }

  const reservation = await Reservation.create({
    customerName,
    customerPhone,
    customerEmail,
    table: tableId,
    date,
    partySize,
    notes,
    handledBy: handledByUser,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, reservation, "Reservation created successfully"));
});

// ── Get All Reservations ──────────────────────────────────────────────────────
export const getAllReservations = asyncHandler(async (req, res) => {
  // TODO: Return reservations, filter by date or status
  // Query params: ?date=2024-12-25&status=confirmed
  // Populate: table, handledBy

  const { date, status } = req.query;

  const filter = {};

  if (date) {
    filter.date = date;
  }

  if (status) {
    filter.status = status;
  }

  const reservations = await Reservation.find(filter).populate("table", "tableNumber capacity location status").populate("handledBy", "name role");

  return res
    .status(200)
    .json(new ApiResponse(200, reservations, "Reservations fetched successfully"));
});

// ── Get Reservation by ID ─────────────────────────────────────────────────────
export const getReservationById = asyncHandler(async (req, res) => {
  // TODO: Return single reservation populated with table info

  const reservation = await Reservation.findById(req.params.id).populate("table", "tableNumber capacity location status").populate("handledBy", "name role");

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, reservation, "Reservation fetched successfully"));
});

// ── Update Reservation ────────────────────────────────────────────────────────
export const updateReservation = asyncHandler(async (req, res) => {
  // TODO: Update date, partySize, notes, or reassign table
  // Re-check availability if table or date changes

  const { customerName, customerPhone, customerEmail, date, partySize, notes } = req.body;

  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  reservation.customerName = customerName;
  reservation.customerPhone = customerPhone;
  reservation.customerEmail = customerEmail;
  reservation.date = date;
  reservation.partySize = partySize;
  reservation.notes = notes;

  await reservation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, reservation, "Reservation updated successfully"));
});

// ── Confirm Reservation ───────────────────────────────────────────────────────
export const confirmReservation = asyncHandler(async (req, res) => {
  // TODO: Change status from "pending" → "confirmed"
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  reservation.status = "confirmed";
  await reservation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, reservation, "Reservation confirmed successfully"));
});

// ── Cancel Reservation ────────────────────────────────────────────────────────
export const cancelReservation = asyncHandler(async (req, res) => {
  // TODO: Set status to "cancelled"
  // Free up the table (set table status back to "available" if no other bookings)
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  reservation.status = "cancelled";
  await reservation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, reservation, "Reservation cancelled successfully"));
});
