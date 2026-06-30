import * as inviteRepo from "./inviteRepository.js";
import { pool } from "../../config/database.js";
import { compareHash, hashText } from "../../utils/hash.js";



export async function getInviteInfo(token) {
  const invite = await inviteRepo.getInviteByToken(token);
  if (!invite) {
    throw {
      statusCode: 404,
      message: "Invite not found",
    };
  }
  if (invite.accepted_at) {
    throw { statusCode: 410, message: "This invite has already been used" };
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw {
      statusCode: 410,
      message: "Invite has expired",
    };
  }

  const existingUser = await inviteRepo.checkUserExists(invite.email);

  return {
    organization_name: invite.organization_name,
    organizationSlug: invite.organization_slug,
    email: invite.email,
    role: invite.role,
    existingUser: Boolean(existingUser),
  };
}

export async function acceptInviteNewUser(token, { full_name, password }) {
  const invite = await inviteRepo.getInviteByToken(token);

  if (
    !invite ||
    invite.accepted_at ||
    new Date(invite.expires_at) < new Date()
  ) {
    throw {
      statusCode: 404,
      message: "Invalid or expired invite ",
    };
  }

  // already to nahi hai ye
  const alreadyExists = await inviteRepo.checkUserExists(invite.email);
  if (alreadyExists) {
    throw {
      statusCode: 409,
      message: "An account already exists for this email",
    };
  }

  const password_hash = await hashText(password);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const res = await client.query(
      `INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at`,
      [full_name, invite.email, password_hash],
    );

    const user = res.rows[0];

    // org
    await client.query(
      `INSERT INTO organization_members (user_id, organization_id, role) VALUES ($1, $2, $3)`,
      [user.id, invite.organization_id, invite.role],
    );

    await client.query(
      `UPDATE org_invites SET accepted_at = NOW() WHERE token = $1`,
      [token],
    );

    await client.query("COMMIT");

    return {
      user,
      organization: {
        id: invite.organization_id,
        name: invite.organization_name,
        slug: invite.organization_slug,
        role: invite.role,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function alreadyExistingUser(token, { email, password }) {
  const invite = await inviteRepo.getInviteByToken(token);
  if (
    !invite ||
    invite.accepted_at ||
    new Date(invite.expires_at) < new Date()
  ) {
    throw {
      statusCode: 404,
      message: "Invalid or expired invite ",
    };
  }

  if (email.toLowerCase() !== invite.email.toLowerCase()) {
    throw {
      statusCode: 400,
      message: `This invite was sent to ${invite.email}. Please log in with that email.`,
    };
  }

  const userRes = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  if (!userRes.rows[0]) {
    throw {
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  const user = userRes.rows[0];

  const validPassword = await compareHash(password, user.password_hash);
  if (!validPassword) {
    throw {
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  const isAlready = await inviteRepo.checkAlreadyMember(
    invite.organization_id,
    user.id,
  );
  if (isAlready) {
    throw {
      statusCode: 409,
      message: "You are already member of the organization",
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO organization_members (user_id, organization_id, role) VALUES ($1, $2, $3)`,
      [user.id, invite.organization_id, invite.role],
    );

    await client.query(
      `UPDATE org_invites SET accepted_at = NOW() WHERE token = $1`,
      [token],
    );

    await client.query("COMMIT");

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at,
      },
      organization: {
        id: invite.organization_id,
        name: invite.organization_name,
        slug: invite.organization_slug,
        role: invite.role,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
