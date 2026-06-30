import { Resend } from "resend";
import config from "../config/index.js";
import logger from "./logger.js";

const resend = new Resend(config.smtp.resendApiKey);


export async function sendEmail({ to, subject, html, from }) {
  const sender = from || `LuminaTrace <${config.smtp.from}>`;

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
    });

    if (error) {
      logger.error({ error, to, subject }, "Resend API returned an error");
      throw new Error(error.message || "Email delivery failed");
    }

    logger.info({ id: data?.id, to, subject }, "Email sent successfully via Resend");
    return data;
  } catch (err) {
    logger.error({ error: err.message, to, subject }, "Failed to send email via Resend");
    throw err;
  }
}


export const transporter = {
  sendMail: ({ from, to, subject, html }) =>
    sendEmail({ from, to, subject, html }),
};
