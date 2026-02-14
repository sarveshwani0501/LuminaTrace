import bcrypt from "bcrypt";
import config from "../config/index.js";

export async function hashText(text) {
  const salt = await bcrypt.genSalt(config.security.bcryptRounds);
  return bcrypt.hash(text, salt);
}

export async function compareHash(text, hash) {
  return bcrypt.compare(text, hash);
}



