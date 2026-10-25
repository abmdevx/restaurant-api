import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import healthRoute from "./routes/health.route.js";
import userRoute from "./routes/user.route.js";
import menuRoute from "./routes/menu.route.js";
import tableRoute from "./routes/table.route.js";
import reservationRoute from "./routes/reservation.route.js";
import orderRoute from "./routes/order.route.js";
import inventoryRoute from "./routes/inventory.route.js";
import reportRoute from "./routes/report.route.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONT_END_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/v1/health", healthRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/tables", tableRoute);
app.use("/api/v1/reservations", reservationRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/inventory", inventoryRoute);
app.use("/api/v1/reports", reportRoute);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: [],
  });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource identifier",
      errors: [],
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

export default app;

/*
app.js responsibilities:
- Middleware registration
- Route mounting
- Global error handling
*/
