import { authController } from "./authController.js";
import {
  signupSchema,
  loginSchema,
  signupViaInviteSchema,
  sendEmailVerificationSchema,
  verifyEmailSchema,
  sendPasswordResetRequestSchema,
  resetPasswordSchema,
  changePasswordSchema
} from "./authSchema.js";
import { authenticate } from "../../middlewares/authenticate.js";

export default async function authRoutes(fastify) {
  const ctrl = authController(fastify);

  fastify.post("/auth/signup", { schema: signupSchema }, ctrl.signup);

  fastify.post("/auth/login", { schema: loginSchema }, ctrl.login);

  // to be removed
  // fastify.post(
  //   "/auth/signup/invite/:token",
  //   { schema: signupViaInviteSchema },
  //   ctrl.signupUsingInvite,
  // );

  fastify.post("/auth/logout", ctrl.logout);


  // /auth/verify-email/send
  fastify.post("/auth/verify-email/send", { schema: sendEmailVerificationSchema }, ctrl.sendOTPForEmailVerification);
  // /auth/verify-email/verify
  fastify.post("/auth/verify-email/verify", { schema: verifyEmailSchema }, ctrl.verifyOTPForEmailVerification);

  // /auth/password-reset/request
  fastify.post("/auth/password-reset/request", { schema: sendPasswordResetRequestSchema }, ctrl.sendPasswordResetRequest);
  
  // /auth/password-reset/verify (we rename the verb to reset)
  fastify.post("/auth/password-reset/reset", { schema: resetPasswordSchema }, ctrl.resetPassword);

  // /auth/password/change (authenticated endpoint)
  fastify.post("/auth/password/change", { schema: changePasswordSchema, preValidation: [authenticate] }, ctrl.changePassword);
}
