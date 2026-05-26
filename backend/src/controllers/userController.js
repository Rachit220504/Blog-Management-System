const User = require('../models/User');
const ApiResponse = require('../helpers/apiResponse');

// @desc    Get all users (paginated)
// @route   GET /api/users
// @access  Private (Super Admin)
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Exclude current super admin from the list if desired, or keep all. We'll keep all.
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return ApiResponse.success(res, users, 'Users loaded', 200, {
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Super Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['super_admin', 'editor', 'author', 'user'].includes(role)) {
      return ApiResponse.error(res, 'Please provide a valid role (super_admin, editor, author, user)', 400);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    // Prevent Super Admin from changing their own role (safeguard)
    if (user._id.toString() === req.user.id) {
      return ApiResponse.error(res, 'Super Admins cannot demote themselves. Another Super Admin must do it.', 400);
    }

    user.role = role;
    await user.save();

    return ApiResponse.success(res, user, `User role updated successfully to ${role}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/status
// @access  Private (Super Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user.id) {
      return ApiResponse.error(res, 'You cannot deactivate your own account', 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    return ApiResponse.success(res, user, `User status changed to ${user.isActive ? 'active' : 'inactive'}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  toggleUserStatus,
};
