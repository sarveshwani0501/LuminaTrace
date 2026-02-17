import * as inviteController from "./inviteController.js";
import {
  getInviteSchema,
  createNewUserSchema,
  alreadyExistSchema,
} from "./inviteSchema.js";
export default async function inviteRoute(fastify) {
  fastify.get(
    "/invites/:token",
    { schema: getInviteSchema },
    inviteController.getInvite,
  );

  fastify.post(
    "/invites/:token/new",
    { schema: createNewUserSchema },
    inviteController.acceptAsNewUser,
  );

  fastify.post(
    "/invites/:token/existing",
    { schema: alreadyExistSchema },
    inviteController.acceptAsExistingUser,
  );

  //
}
