import config from "../config/index.js";

const errorHandler = (error, request, reply) => {
  request.log.error(error);

  const statusCode = error.statusCode || 500;

  const response = {
    error: error.name || "InternalSeverError",
    message: error.message || "Unexpected error",
    statusCode: statusCode,
  };

  reply.code(statusCode).send(response);
};

export default errorHandler;
