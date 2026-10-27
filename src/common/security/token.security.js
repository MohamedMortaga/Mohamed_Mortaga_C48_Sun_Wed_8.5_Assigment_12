import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ADMIN_ACCESS_SIGNATURE,
  JWT_ADMIN_REFRESH_SIGNATURE,
  JWT_REFRESH_EXPIRES_IN,
  JWT_USER_ACCESS_SIGNATURE,
  JWT_USER_REFRESH_SIGNATURE,
} from "../../config/config.js";
import { findByIdDoc } from "../../DB/db.repo.js";
import { randomUUID } from "node:crypto";
import {
  getUserRevokeTokenKey,
  setValue,
} from "../cache.service.js";
import userModel from "../../DB/model/user.model.js";
import { TokenTypeEnum } from "../enum/token.enum.js";
import { RoleEnum } from "../enum/user.enum.js";
import {
  BadRequestException,
  UnAuthorizeException,
} from "../exceptions/app.exceptions.js";

export function signToken({ payload = {}, signature, options } = {}) {
  return jwt.sign(payload, signature, options);
}

export function verifyToken({ token, signature } = {}) {
  return jwt.verify(token, signature);
}

export function decodeToken(token) {
  return jwt.decode(token);
}

export function getSignature(userRole = RoleEnum.USER) {
  let signatures = {};

  switch (userRole) {
    case RoleEnum.USER:
      signatures.access_signature = JWT_USER_ACCESS_SIGNATURE;
      signatures.refresh_signature = JWT_USER_REFRESH_SIGNATURE;
      break;
    case RoleEnum.ADMIN:
      signatures.access_signature = JWT_ADMIN_ACCESS_SIGNATURE;
      signatures.refresh_signature = JWT_ADMIN_REFRESH_SIGNATURE;
      break;

    default:
      break;
  }

  return signatures;
}

export function createLoginTokens({
  user,
  options,
  refreshExpiresIn = JWT_REFRESH_EXPIRES_IN,
} = {}) {
  const { access_signature, refresh_signature } = getSignature(user.role);

  const jwtid = randomUUID();

  const access_token = signToken({
    signature: access_signature,
    options: {
      ...options,
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      subject: user.id,
      audience: [user.role],
      jwtid,
    },
  });

  const refresh_token = signToken({
    signature: refresh_signature,
    options: {
      ...options,
      expiresIn: refreshExpiresIn,
      subject: user.id,
      audience: [user.role],
      jwtid,
    },
  });

  return { access_token, refresh_token };
}

export async function checkToken({ token, tokenType } = {}) {
  const payload = decodeToken(token);

  if (!payload.aud?.length) {
    throw BadRequestException({ errMsg: "Old Token data, Login Again" });
  }

  if (!payload.sub) {
    throw UnAuthorizeException({ errMsg: "Id Not Found" });
  }

  const { access_signature, refresh_signature } = getSignature(payload.aud[0]);

  jwt.verify(
    token,
    tokenType == TokenTypeEnum.ACCESS ? access_signature : refresh_signature,
  );

  const user = await findByIdDoc({ model: userModel, id: payload.sub });

  if (!user) {
    throw UnAuthorizeException({ errMsg: "User Not Found" });
  }

  return { user, payload };
}

export async function revokeToken(payload) {
  const tokenExpiryDate = payload.iat + JWT_REFRESH_EXPIRES_IN; // 10/2027

  const consumedTime = Date.now() / 1000 - payload.iat;

  await setValue({
    key: getUserRevokeTokenKey({ userId: payload.sub, jti: payload.jti }),
    value: payload.jti,
    // seconds left in the refresh token's life (Redis needs a whole number)
    options: {
      expiration: {
        value: Math.ceil(tokenExpiryDate - payload.iat - consumedTime),
      },
    },
  });
}
