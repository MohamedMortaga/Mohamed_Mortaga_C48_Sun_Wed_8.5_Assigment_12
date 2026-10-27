import CryptoJS from "crypto-js";
import { ENCRYPT_KEY } from "../../config/config.js";

export function encryptValue({ value, key = ENCRYPT_KEY }) {
  return CryptoJS.AES.encrypt(value, key).toString();
}

export function decryptValue({ cipherValue, key = ENCRYPT_KEY }) {
  const bytes = CryptoJS.AES.decrypt(cipherValue, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
