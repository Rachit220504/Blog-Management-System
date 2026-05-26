const StatusCodes = require('../constants/statusCodes');

class ApiResponse {
  static send(res, {
    statusCode = StatusCodes.OK,
    success = true,
    message = 'Success',
    data = null,
    meta = null,
  } = {}) {
    const payload = { success, message };

    if (data !== null && data !== undefined) {
      payload.data = data;
    }

    if (meta) {
      payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
  }

  static success(res, data, message = 'Success', statusCode = StatusCodes.OK) {
    let meta = null;

    if (arguments.length > 4) {
      meta = arguments[4];
    }

    return this.send(res, { statusCode, success: true, message, data, meta });
  }

  static created(res, data, message = 'Created successfully') {
    let meta = null;

    if (arguments.length > 3) {
      meta = arguments[3];
    }

    return this.send(res, { statusCode: StatusCodes.CREATED, success: true, message, data, meta });
  }

  static error(res, message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, data = null) {
    return this.send(res, { statusCode, success: false, message, data });
  }
}

module.exports = ApiResponse;