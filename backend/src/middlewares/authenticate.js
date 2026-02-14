const authenticate = async (request, reply) => {
  try {
    const token = request.cookies.token;

    if (!token) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Authentication token is missing",
      });
    }

    await request.jwtVerify();

    request.log.info(
      { userId: request.user.id },
      "User authenticated via cookie",
    );
  } catch (error) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or session expired",
    });
  }
};

export default authenticate;
