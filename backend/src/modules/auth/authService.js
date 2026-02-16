import { pool } from "../../config/database.js";
import { slugify } from "../../utils/slugify.js";
import {
  getUserByEmail,
  createUser,
  createOrganization,
  addMember,
  getUserOrganizations,
  updateLastLogin,
  getInviteByToken,
  markInviteAccepted,
} from "./authRepository.js";
import { hashText, compareHash } from "../../utils/hash.js";

export async function signup({
  full_name,
  email,
  password,
  organization_name,
}) {
  const isEmail = await getUserByEmail(email);
  if (isEmail) {
    throw new Error("Email id already exists");
  }

  const password_hash = await hashText(password);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const user = await createUser({ full_name, email, password_hash });

    const org = await createOrganization({
      name: organization_name,
      slug: slugify(organization_name),
    });

    await addMember({
      userId: user.id,
      organizationId: org.id,
      role: "owner",
    });

    await client.query("COMMIT");
    return {
      user,
      organization: {
        ...org,
        role: "owner",
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function signupViaInvite({ full_name, email, password, token }) {
  const tokenVerification = await getInviteByToken(token);
  if (!tokenVerification) {
    throw new Error("Token Invalid");
  }

  if (tokenVerification.email.toLowerCase() !== email.toLowerCase()) {
    throw new Error("Invite mail is different");
  }
  const isEmail = await getUserByEmail(email);
  if (isEmail) {
    throw new Error("User already exists");
  }
  const password_hash = await hashText(password);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const user = await createUser({ full_name, email, password_hash });

    await addMember({
      userId: user.id,
      organizationId: tokenVerification.organization_id,
      role: tokenVerification.role,
    });

    await markInviteAccepted(token, client);

    await client.query("COMMIT");

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      organization: {
        id: tokenVerification.organization_id,
        name: tokenVerification.organization_name,
        slug: tokenVerification.organization_slug,
        role: tokenVerification.role,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function login({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("User does not exist");
  }
  const isMatch = await compareHash(password, user.password_hash);

  if (!isMatch) {
    throw new Error("Password is incorrect");
  }

  const orgList = await getUserOrganizations(user.id);

  await updateLastLogin(user.id);

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
    },
    orgList,
  };
}
