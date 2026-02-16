import { signup, signupViaInvite, login } from "./authService.js";

export function authController(fastify) {
  async function signupHandler(req, reply) {
    try {
      const { full_name, email, password, organization_name } = req.body;

      const { user, organization } = await signup({
        full_name,
        email,
        password,
        organization_name,
      });

      const token = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: "24h" },
      );

      reply.setAuthCookie(token);

      return reply.code(201).send({ user, organization });
    } catch (error) {
      if (error.message === "Email id already exists") {
        return reply.code(409).send({
          error: "ConflictError",
          message: error.message,
          statusCode: 409,
        });
      }
      throw error;
    }
  }

  async function signupUsingInviteHandler(req, reply) {
    try {
      const { full_name, email, password } = req.body;
      const { token } = req.params;

      const { user, organization } = await signupViaInvite({
        full_name,
        email,
        password,
        token,
      });

      const jwtToken = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: "24h" },
      );

      reply.setAuthCookie(jwtToken);
      return reply.code(201).send({ user, organization });
    } catch (error) {
      if (
        error.message === "Token Invalid" ||
        error.message === "Invite mail is different"
      ) {
        return reply.code(400).send({
          error: "BadRequestError",
          message: error.message,
          statusCode: 400,
        });
      }
      if (error.message === "User already exists") {
        return reply.code(409).send({
          error: "ConflictError",
          message: error.message,
          statusCode: 409,
        });
      }
      throw error;
    }
  }

  async function loginHandler(req, reply) {
    try {
      const { email, password } = req.body;

      const { user, orgList } = await login({ email, password });

      const token = fastify.jwt.sign(
        { userId: user.id, email: email },
        { expiresIn: "24h" },
      );
      reply.setAuthCookie(token);
      return reply.code(200).send({ user, organizations: orgList });
    } catch (error) {
      if (error.message === "User does not exist") {
        return reply.code(404).send({
          error: "NotFoundError",
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === "Password is incorrect") {
        return reply.code(401).send({
          error: "UnauthorizedError",
          message: error.message,
          statusCode: 401,
        });
      }
      throw error;
    }
  }

  async function logoutHandler(req, reply) {
    reply.clearCookie("token", { path: "/" });

    return reply.code(200).send({
      message: "Logged out successfully",
    });
  }

  return {
    signup: signupHandler,
    signupUsingInvite: signupUsingInviteHandler,
    login: loginHandler,
    logout: logoutHandler,
  };
}
