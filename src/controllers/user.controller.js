import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ── Helper ────────────────────────────────────────────────────────────────────
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens!");
  }
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
};

// ── Register ──────────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(400, "User with this email already exists.");
  }

  const user = await User.create({ name, email, password, role });

  // FIX: select out sensitive fields before returning
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "User could not be created.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully!"));
});

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully!"));
});

// ── Change Password ─────────────────────────────────────────────────────────────

export const changePassword = asyncHandler(async (req, res) => {
  // TODO: const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

  const { oldPassword, newPassword } = req.body;

  console.log(oldPassword, newPassword);
  
  // find user first

  const user = await User.findById(req.user._id);

  if(!user) {
    throw new ApiError(404, "User not found.");
  }

  // compare password is the old password is correct

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if(!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password.");
  }

  // update password

  user.password = newPassword;
  await user.save();

  return res
  .status(200)
  .json(new ApiResponse(
      200,
      {},
      "Password changed successfully!"
  ))
});

// ── Logout ────────────────────────────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(new ApiResponse(200, null, "User logged out successfully!"));
});

// ── Refresh Access Token ──────────────────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request!");
  }

  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token!");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or already used!");
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await generateTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully!"
      )
    );
});

// ── Get Current User ──────────────────────────────────────────────────────────
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully!"));
});

// ── Get All Users (admin) ─────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  // FIX: exclude sensitive fields
  const users = await User.find().select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully!"));
});

// ── Update User (admin) ───────────────────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  // FIX: only check email uniqueness (names are not unique)
  // FIX: exclude the current user from the duplicate check
  if (email) {
    const existedUser = await User.findOne({
      email,
      _id: { $ne: req.params.userId },
    });

    if (existedUser) {
      throw new ApiError(400, "Email is already in use by another account.");
    }
  }

  // FIX: use req.params.userId to match the route /:userId
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { name, email, role },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully!"));
});

// ── Delete User (admin) ───────────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  // FIX: use req.params.userId to match the route /:userId
  // FIX: removed redundant role/owner check — verifyAdmin middleware already handles this
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await User.findByIdAndDelete(user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully!"));
});

export const deleteCurrentUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Account deleted successfully."));
});

export const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, "userIds must be a non-empty array.");
  }

  const result = await User.deleteMany({
    _id: { $in: userIds },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deletedCount: result.deletedCount,
      },
      "Users deleted successfully."
    )
  );
});