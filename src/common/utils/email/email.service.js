import { transporter } from "./email.config.js";
import { EMAIL_USER } from "../../../config/config.js";
import generateOTP from "../../otp.js";
import {
  getEmailBannedKey,
  getEmailKey,
  getEmailTrialsKey,
  getValue,
  incrKey,
  isExists,
  setValue,
  ttlKey,
} from "../../cache.service.js";
import { hashValue } from "../../security/hash.js";
import { EmailTemplate } from "./email.template.js";
import { BadRequestException } from "../../exceptions/app.exceptions.js";

export async function sendMail({ to, cc, bcc, subject, html, attachments }) {
  try {
    const info = await transporter.sendMail({
      from: `"Example Team" <${EMAIL_USER}>`,
      to,
      cc,
      bcc,
      subject,
      html,
      attachments,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}

export async function sendOTP({ email, subject }) {
  const otp = generateOTP();

  await sendMail({
    to: email,
    subject,
    html: EmailTemplate[subject](otp),
  });

  await setValue({
    key: getEmailKey(email, subject),
    value: await hashValue({ value: otp }),
    options: { expiration: { value: 180 } },
  });

  if (await getValue(getEmailTrialsKey(email, subject))) {
    await incrKey({ key: getEmailTrialsKey(email, subject) });
  } else {
    await setValue({
      key: getEmailTrialsKey(email, subject),
      value: 1,
      options: { expiration: { value: 20 * 60 } },
    });
  }
}

export async function checkOTP(email, subject) {
  const oldOTP_TTL = await ttlKey(getEmailKey(email, subject));

  if (oldOTP_TTL > 0) {
    throw BadRequestException({
      errMsg: `Invalid Request, There's already valid OTP, ${oldOTP_TTL}s `,
    });
  }

  const isBlocked = await isExists(getEmailBannedKey(email, subject));

  if (isBlocked) {
    throw BadRequestException({ errMsg: `Please Try Again later` });
  }

  const userTrials = await getValue(getEmailTrialsKey(email, subject));

  if (userTrials == 2) {
    await setValue({
      key: getEmailBannedKey(email, subject),
      value: 0,
      options: { expiration: { value: 25 * 60 } },
    });
  }
}
