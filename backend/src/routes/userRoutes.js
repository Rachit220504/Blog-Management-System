const express = require('express');
const {
  getUsers,
  updateUserRole,
  toggleUserStatus,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');
const asyncHandler = require('../helpers/asyncHandler');
const {
  validateMongoIdParam,
  validateRoleUpdate,
} = require('../middleware/validationMiddleware');

const router = express.Router();

// Restrict all routes in this file to Super Admin only
router.use(protect, authorize('super_admin'));

router.get('/', requirePermission('users:read'), asyncHandler(getUsers));
router.put('/:id/role', validateMongoIdParam('id'), validateRoleUpdate, requirePermission('users:manage'), asyncHandler(updateUserRole));
router.put('/:id/status', validateMongoIdParam('id'), requirePermission('users:manage'), asyncHandler(toggleUserStatus));

module.exports = router;
