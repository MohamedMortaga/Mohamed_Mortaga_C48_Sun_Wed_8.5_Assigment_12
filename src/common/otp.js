import { randomInt } from "node:crypto";

function generateOTP() {
  return randomInt(100000, 999999);
}

export default generateOTP;
