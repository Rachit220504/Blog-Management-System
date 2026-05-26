const User = require('../models/User');
const ApiResponse = require('../helpers/apiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} = require('../services/tokenService');

const buildAuthPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  bio: user.bio,
  avatar: user.avatar,
});

const createTokenPair = async (user) => {
  const refreshTokenVersion = user.refreshTokenVersion || 0;
  const payload = { id: user._id, role: user.role, tokenVersion: refreshTokenVersion };

  return {
    accessToken: generateAccessToken(payload, process.env.JWT_EXPIRES_IN || '15m'),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Generate a JWT Token
 * @param {string} id - The user ID
 * @returns {string} The signed token
 */
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return ApiResponse.error(res, 'User already exists with this email', 400);
    }

    // Create user. Note: first user created in database becomes Super Admin automatically for easier bootstrap.
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'super_admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role,
      status: 'active',
      isActive: true,
    });

    if (user) {
      const { accessToken, refreshToken } = await createTokenPair(user);
      setAuthCookies(res, accessToken, refreshToken);

      return ApiResponse.created(res, {
        ...buildAuthPayload(user),
        accessToken,
        refreshToken,
      }, 'User registered successfully');
    } else {
      return ApiResponse.error(res, 'Invalid user data', 400);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password presence
    if (!email || !password) {
      return ApiResponse.error(res, 'Please provide an email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    // Check active status
    if (!user.isActive) {
      return ApiResponse.error(res, 'Account has been deactivated. Please contact support.', 403);
    }

    if (user.status !== 'active') {
      return ApiResponse.error(res, 'Account status does not allow login.', 403);
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = await createTokenPair(user);
    setAuthCookies(res, accessToken, refreshToken);

    return ApiResponse.success(res, {
      ...buildAuthPayload(user),
      accessToken,
      refreshToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return ApiResponse.error(res, 'Refresh token is required', 401);
    }

    const decoded = verifyRefreshToken(incomingRefreshToken);
    const user = await User.findById(decoded.id).select('+refreshTokenVersion');

    if (!user || !user.isActive || user.status !== 'active') {
      return ApiResponse.error(res, 'Unauthorized refresh attempt', 401);
    }

    if ((user.refreshTokenVersion || 0) !== (decoded.tokenVersion || 0)) {
      return ApiResponse.error(res, 'Refresh token has been revoked', 401);
    }

    const { accessToken, refreshToken } = await createTokenPair(user);
    setAuthCookies(res, accessToken, refreshToken);

    return ApiResponse.success(res, {
      ...buildAuthPayload(user),
      accessToken,
      refreshToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    return ApiResponse.error(res, 'Refresh token expired or invalid', 401);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const userId = req.user?.id;

    if (incomingRefreshToken) {
      const decoded = verifyRefreshToken(incomingRefreshToken);
      const user = await User.findById(userId || decoded.id).select('+refreshTokenVersion');

      if (user && (user.refreshTokenVersion || 0) === (decoded.tokenVersion || 0)) {
        await user.bumpRefreshTokenVersion();
      }
    }

    clearAuthCookies(res);

    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      return ApiResponse.success(res, user, 'Profile loaded');
    } else {
      return ApiResponse.error(res, 'User not found', 404);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      return ApiResponse.success(res, {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        token: generateAccessToken({ id: updatedUser._id }),
      }, 'Profile updated successfully');
    } else {
      return ApiResponse.error(res, 'User not found', 404);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
