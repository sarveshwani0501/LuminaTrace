import config from "../config/index.js";

const getErrorName = (statusCode) => {
  const errorNames = {
    400: "BadRequest",
    401: "Unauthorized",
    403: "Forbidden",
    404: "NotFound",
    409: "Conflict",
    410: "Gone",
    500: "InternalServerError",
    502: "BadGateway",
    503: "ServiceUnavailable",
  };

  return (
    errorNames[statusCode] ||
    (statusCode >= 500 ? "InternalServerError" : "BadRequest")
  );
};

const errorHandler = (error, request, reply) => {
  request.log.error(error);

  const statusCode = error.statusCode || 500;

  const response = {
    error: error.name || getErrorName(statusCode),
    message: error.message || "Unexpected error",
    statusCode: statusCode,
  };

  reply.code(statusCode).send(response);
};

export default errorHandler;
