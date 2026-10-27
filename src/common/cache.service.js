import { client } from "../DB/redis.connection.js";

export function getEmailBaseKey(email) {
  return `User::${email}`;
}

export function getEmailKey(email, subject) {
  return `${getEmailBaseKey(email)}::${subject}`;
}

export function getEmailTrialsKey(email, subject) {
  return `${getEmailBaseKey(email)}::${subject}::Trials`;
}

export function getEmailBannedKey(email, subject) {
  return `${getEmailBaseKey(email)}::${subject}::Banned`;
}

export function getBaseUserRevokeTokenKey(userId) {
  return `User::${userId}::RevokeToken`;
}
export function getUserRevokeTokenKey({ userId, jti }) {
  return `${getBaseUserRevokeTokenKey(userId)}::${jti}`;
}

export async function setValue({
  key,
  value,
  options = { expiration: { type: "EX", value: 100 } },
}) {
  if (typeof value === "object") {
    value = JSON.stringify(value);
  }

  if (!options.expiration.type) {
    options.expiration.type = "EX";
  }

  return await client.set(key, value, options);
}

export async function getValue(key) {
  let result;
  try {
    result = await client.get(key);
    return JSON.parse(result);
  } catch (error) {
    return result;
  }
}

export async function ttlKey(key) {
  return await client.ttl(key);
}

export async function isExists(keys) {
  return await client.exists(keys);
}

export async function updateValue({
  key,
  value,
  options = { expiration: { type: "EX", value: 100 } },
}) {
  const isKeyExists = await isExists(key);

  if (!isKeyExists) {
    return 0;
  }

  return await setValue({ key, value, options });
}

export async function delKey(keys) {
  return await client.del(keys);
}

export async function getAllKeys(prefix) {
  return await client.keys(`${prefix}*`);
}

export async function incrKey({ key, value = 1 }) {
  return await client.incrBy(key, value);
}
