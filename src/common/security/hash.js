import * as bcrypt from "bcrypt";
import * as argon from "argon2";
import { SALT_ROUND } from "../../config/config.js";
import { HashToolEnum } from "../enum/hash.enum.js";

export async function hashValue({
  value,
  saltRound = SALT_ROUND,
  tool = HashToolEnum.ARGON,
}) {
  let hashedValue;

  if (typeof value !== "string") {
    value = String(value);
  }

  switch (tool) {
    case HashToolEnum.BCRYPT:
      hashedValue = await bcrypt.hash(value, saltRound);
      break;

    case HashToolEnum.ARGON:
      hashedValue = await argon.hash(value);
      break;

    default:
      throw new Error(`Unsupported hash tool "${tool}"`);
  }

  return hashedValue;
}

export async function compareHash({ value, hash, tool = HashToolEnum.ARGON }) {
  let compareResult;

  switch (tool) {
    case HashToolEnum.BCRYPT:
      compareResult = await bcrypt.compare(value, hash);
      break;

    case HashToolEnum.ARGON:
      compareResult = await argon.verify(hash, value);
      break;

    default:
      throw new Error(`Unsupported hash tool "${tool}"`);
  }

  return compareResult;
}
