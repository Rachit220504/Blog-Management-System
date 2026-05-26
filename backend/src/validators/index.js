const {
  validateMongoIdParam,
  validateRegisterUser,
  validateLoginUser,
  validateProfileUpdate,
  validatePostPayload,
  validateRoleUpdate,
} = require('../middleware/validationMiddleware');

module.exports = {
  validateMongoIdParam,
  validateRegisterUser,
  validateLoginUser,
  validateProfileUpdate,
  validatePostPayload,
  validateRoleUpdate,
};