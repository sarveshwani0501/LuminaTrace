import * as inviteService from "./inviteService.js";

export async function getInvite(req, reply) {
  const { token } = req.params;
  const info = await inviteService.getInviteInfo(token);
  return reply.code(200).send(info);
}

export async function acceptAsNewUser(req, reply) {
  const { full_name, password } = req.body;

  const { token } = req.params;

  const { user, organization } = await inviteService.acceptInviteNewUser(
    token,
    { full_name, password },
  );

  const jwtToken = req.server.jwt.sign(
    { userId: user.id, email: user.email },
    { expiresIn: "24h" },
  );

  reply.setAuthCookie(jwtToken);

  return reply.code(200).send({
    user,
    organization,
  });
}

export async function acceptAsExistingUser(req, reply) {
  const { email, password } = req.body;
  const { token } = req.params;
  const { user, organization } = await inviteService.alreadyExistingUser(
    token,
    { email, password },
  );

  const jwtToken = req.server.jwt.sign(
    { userId: user.id, email: user.email },
    { expiresIn: "24h" },
  );

  reply.setAuthCookie(jwtToken);

  return reply.code(200).send({
    user,
    organization,
  });
}
