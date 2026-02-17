import { authController } from "./authController.js";
import {
  signupSchema,
  loginSchema,
  signupViaInviteSchema,
} from "./authSchema.js";

export default async function authRoutes(fastify) {
  const ctrl = authController(fastify);

  fastify.post("/auth/signup", { schema: signupSchema }, ctrl.signup);

  fastify.post("/auth/login", { schema: loginSchema }, ctrl.login);

  // to be removed
  fastify.post(
    "/auth/signup/invite/:token",
    { schema: signupViaInviteSchema },
    ctrl.signupUsingInvite,
  );

  fastify.post("/auth/logout", ctrl.logout);
}
