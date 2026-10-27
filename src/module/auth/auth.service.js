import { createDoc, findOneDoc } from "../../DB/db.repo.js";
import userModel from "../../DB/model/user.model.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exceptions/app.exceptions.js";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { compareHash, hashValue } from "../../common/security/hash.js";
import { encryptValue } from "../../common/security/encryption.js";
import { createLoginTokens } from "../../common/security/token.security.js";

import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_IDS } from "../../config/config.js";

import {
  delKey,
  getAllKeys,
  getBaseUserRevokeTokenKey,
  getEmailKey,
  getValue,
  ttlKey,
} from "../../common/cache.service.js";
import emailEvents from "../../common/utils/email/email.event.js";
import { checkOTP } from "../../common/utils/email/email.service.js";
import { EmailSubjectEnum } from "../../common/enum/email.enum.js";

const client = new OAuth2Client();

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_IDS,
  });

  return ticket.getPayload();
}

export async function signupOrLoginWithGoogle(idToken) {
  const result = await verify(idToken);

  if (!result.email_verified) {
    throw BadRequestException({ errMsg: "Please verify your email first" });
  }

  const userData = await findOneDoc({
    model: userModel,
    filter: { email: result.email },
  });

  if (userData) {
    if (userData.provider === ProviderEnum.SYSTEM) {
      throw BadRequestException({
        errMsg:
          "You can't login with Google, you need to login with your password",
      });
    }
    if (userData.provider === ProviderEnum.GOOGLE) {
      return { statusCode: 200, tokens: createLoginTokens({ user: userData }) };
    }
  }

  const [newUser] = await createDoc({
    model: userModel,
    insertedData: {
      username: `${result.given_name} ${result.family_name}`,
      email: result.email,
      provider: ProviderEnum.GOOGLE,
      confirmEmail: true,
      profilePicPath: result.picture,
    },
  });

  return { statusCode: 201, tokens: createLoginTokens({ user: newUser }) };
}

export async function signup(userData) {
  const { email } = userData;

  const userEmail = await findOneDoc({ model: userModel, filter: { email } });

  if (userEmail) {
    throw ConflictException({ errMsg: "Email Already Exists" });
  }

  userData.password = await hashValue({ value: userData.password });

  userData.phone = encryptValue({ value: userData.phone });
  const newUser = await createDoc({ model: userModel, insertedData: userData });

  emailEvents.emit("send-otp", {
    email,
    subject: EmailSubjectEnum.CONFIRM_EMAIL,
  });

  return newUser;
}

//--------------------------- OTP (email confirmation)

export async function confirmEmail(bodyData) {
  const { email, otp } = bodyData;

  const user = await findOneDoc({
    model: userModel,
    filter: { email, confirmEmail: false },
  });

  if (!user) {
    throw NotFoundException({ errMsg: "Invalid Account" });
  }

  const hashedOTP = await getValue(
    getEmailKey(email, EmailSubjectEnum.CONFIRM_EMAIL),
  );

  if (!hashedOTP) {
    throw BadRequestException({ errMsg: "OTP Expired" });
  }

  const isOTPValid = await compareHash({ value: otp, hash: hashedOTP });

  if (!isOTPValid) {
    throw BadRequestException({ errMsg: "Invalid OTP" });
  }

  user.confirmEmail = true;
  await user.save();
  await delKey(getEmailKey(email, EmailSubjectEnum.CONFIRM_EMAIL));
}

export async function resendConfirmEmail(email) {
  const user = await findOneDoc({
    model: userModel,
    filter: { email, confirmEmail: false },
  });

  if (!user) {
    throw NotFoundException({ errMsg: "Invalid Account" });
  }

  await checkOTP(email, EmailSubjectEnum.CONFIRM_EMAIL);

  emailEvents.emit("send-otp", {
    email,
    subject: EmailSubjectEnum.CONFIRM_EMAIL,
  });
}

export async function sendOtpForgetPassword(email) {
  const user = await findOneDoc({
    model: userModel,
    filter: { email, confirmEmail: true },
  });

  if (!user) {
    return;
  }

  await checkOTP(email, EmailSubjectEnum.FORGET_PASSWORD);

  emailEvents.emit("send-otp", {
    email,
    subject: EmailSubjectEnum.FORGET_PASSWORD,
  });
}

export async function verifyForgetPasswordOTP(bodyData) {
  const { email, otp } = bodyData;

  const user = await findOneDoc({
    model: userModel,
    filter: { email, confirmEmail: true },
  });

  if (!user) {
    throw NotFoundException({ errMsg: "Invalid Account" });
  }

  const hashedOTP = await getValue(
    getEmailKey(email, EmailSubjectEnum.FORGET_PASSWORD),
  );

  if (!hashedOTP) {
    throw BadRequestException({ errMsg: "OTP Expired" });
  }

  const isOTPValid = await compareHash({ value: otp, hash: hashedOTP });

  if (!isOTPValid) {
    throw BadRequestException({ errMsg: "Invalid OTP" });
  }

  return user;
}

export async function resetPassword(bodyData) {
  const { email, otp, password } = bodyData;

  const user = await verifyForgetPasswordOTP({ email, otp });

  user.password = await hashValue({ value: password });
  user.changeCredentialTime = new Date();
  await user.save();

  const result = await Promise.all([
    getAllKeys(getBaseUserRevokeTokenKey(user.id)),
    getAllKeys(getEmailKey(email, EmailSubjectEnum.FORGET_PASSWORD)),
  ]);

  const keys = [...result[0], ...result[1]];
  // Redis DEL with an empty list fails, so only delete when there are keys
  if (keys.length) {
    await delKey(keys);
  }
}

// How many seconds are left before the OTP expires (shows the Redis TTL).
export async function otpTimeLeft({ email }) {
  const secondsLeft = await ttlKey(
    getEmailKey(email, EmailSubjectEnum.CONFIRM_EMAIL),
  );

  return { email, secondsLeft: secondsLeft > 0 ? secondsLeft : 0 };
}

export async function login(userData) {
  const { email, password } = userData;

  const user = await findOneDoc({ model: userModel, filter: { email } });

  if (!user) {
    throw NotFoundException({ errMsg: "Invalid Email or Password" });
  }

  if (!user.confirmEmail) {
    throw BadRequestException({ errMsg: "Confirm your email first" });
  }

  const isMatch = await compareHash({ value: password, hash: user.password });

  if (!isMatch) {
    throw NotFoundException({ errMsg: "Invalid Email or Password" });
  }

  return createLoginTokens({ user });
}
