import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
  NOTE: Must be used AFTER verifyJWT — relies on req.user being set.
  Restricts routes to users with role "admin" only.
*/
export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Access denied! Admin privileges required.");
  }
  next();
});
