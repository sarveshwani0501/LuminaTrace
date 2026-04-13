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
  updateEmailVerificationStatus,
  updatePassword
} from "./authRepository.js";
import { hashText, compareHash } from "../../utils/hash.js";

import crypto from "crypto";
import redis from "../../config/redis.js";
import { transporter } from "../alerts/alertService.js";
import config from "../../config/index.js";

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



export async function sendOTPForEmailVerification(email) {
  const user = await getUserByEmail(email);
  if(!user) {
    throw new Error('User does not exist');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redis.set(`otp:verification:${email}`, otp, 'EX', 900);

  await sendOTPEmail(email, otp, 'verification');

  return { message: 'OTP sent successfully' };

}


export async function verifyOTPForEmailVerification(email, otp) {
  const user = await getUserByEmail(email);
  if(!user) {
    throw new Error('User does not exist');
  }

  const storedOTP = await redis.get(`otp:verification:${email}`);
  if(!storedOTP) {
    throw new Error('OTP expired');
  }

  if(storedOTP !== otp) {
    throw new Error('Invalid OTP');
  }

  await redis.del(`otp:verification:${email}`);
  
  await updateEmailVerificationStatus(email);

  return { message: 'OTP verified successfully', user };
}




export async function sendPasswordResetRequest(email) {
  const user = await getUserByEmail(email);
  if(!user) {
    throw new Error('User does not exist');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const url = 'http://localhost:5173/password-reset/verify?token=' + token;
  await redis.set(`reset:${token}`, email, 'EX', 900);
  await sendOTPEmail(email, url, 'reset');
  return { message: 'Password reset link sent successfully' };
}

export async function resetPassword(token, newPassword) {
  if(!token) throw new Error('Token cannot be null');
  
  const email = await redis.get(`reset:${token}`);
  if(!email) {
    throw new Error('Token expired');
  }

  const hashedPassword = await hashText(newPassword);

  const res = await updatePassword(email, hashedPassword);

  if(!res) {
    throw new Error('Password change failed');
  }

  await redis.del(`reset:${token}`);

  return { message: 'Password Reset Successful' }
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await getUserById(userId);
  if (!user) throw new Error('User does not exist');

  const { password_hash } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]).then(r => r.rows[0]);

  const isMatch = await compareHash(oldPassword, password_hash);
  if (!isMatch) {
    throw new Error('Incorrect old password');
  }

  const hashedPassword = await hashText(newPassword);
  const res = await updatePasswordById(userId, hashedPassword);

  if(!res) {
    throw new Error('Password change failed');
  }

  return { message: 'Password changed successfully' };
}





// Helper method to send emails

async function sendOTPEmail(email, otp, type) {
  const subject = type === 'verification' 
    ? 'Verify Your Email - LuminaTrace'
    : 'Password Reset Code - LuminaTrace';
    
  const html = `
    <h1>${type === 'verification' ? 'Verify Your Email' : 'Reset Your Password'}</h1>
    <p>Your verification code is:</p>
    <h2 style="background: #f0f0f0; padding: 10px; font-family: monospace;">
      ${otp}
    </h2>
    <p>This ${type === 'verification' ? 'verification code' : 'reset link'} expires in 15 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  

  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject,
    html: html
  })
}