import dotenv from "dotenv";
import path from "node:path";

// NODE_ENV => DEV / PROD

dotenv.config({
  path:
    process.env.NODE_ENV == "PROD"
      ? path.resolve("./.env.prod")
      : path.resolve("./.env.dev"),
});

export const PORT = Number(process.env.PORT) || 3000;
export const DB_URI = process.env.DB_ATLAS || "";
export const DB_NAME = process.env.DB_NAME || "saraha_dev";
export const SALT_ROUND = Number(process.env.SALT_ROUND) || 12;
export const ENCRYPT_KEY = process.env.ENCRYPT_KEY || "";

export const JWT_ACCESS_EXPIRES_IN = Number(process.env.JWT_ACCESS_EXPIRES_IN);
export const JWT_USER_ACCESS_SIGNATURE = process.env.JWT_USER_ACCESS_SIGNATURE;
export const JWT_ADMIN_ACCESS_SIGNATURE =
  process.env.JWT_ADMIN_ACCESS_SIGNATURE;

export const JWT_REFRESH_EXPIRES_IN = Number(
  process.env.JWT_REFRESH_EXPIRES_IN,
);
export const JWT_USER_REFRESH_SIGNATURE =
  process.env.JWT_USER_REFRESH_SIGNATURE;
export const JWT_ADMIN_REFRESH_SIGNATURE =
  process.env.JWT_ADMIN_REFRESH_SIGNATURE;

export const GOOGLE_CLIENT_IDS = process.env.GOOGLE_CLIENT_IDS.split(",");
console.log({ GOOGLE_CLIENT_IDS });

export const REDIS_URI = process.env.REDIS_URI;

export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

