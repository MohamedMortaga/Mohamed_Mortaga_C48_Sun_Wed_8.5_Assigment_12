import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} from "../../config/config.js";
import { BadRequestException } from "../../common/exceptions/app.exceptions.js";
import {
  createLoginTokens,
  revokeToken,
} from "../../common/security/token.security.js";
import {
  delKey,
  getAllKeys,
  getBaseUserRevokeTokenKey,
  getUserRevokeTokenKey,
  setValue,
} from "../../common/cache.service.js";
import { LogoutActionEnum } from "../../common/enum/system.enum.js";

export async function rotateToken(payload, user) {
  const tokenExpiryDate = payload.iat + JWT_ACCESS_EXPIRES_IN; // 1/10
  const currentDate = Date.now() / 1000; // 30/9

  if (tokenExpiryDate > currentDate) {
    throw BadRequestException({ errMsg: "Old Token Still Valid" });
  }

  const tokens = createLoginTokens({
    user,
    refreshExpiresIn:
      JWT_REFRESH_EXPIRES_IN - (Math.ceil(Date.now() / 1000) - payload.iat),
  });

  await revokeToken(payload);

  return tokens;
}

export async function logout(payload, user, action = LogoutActionEnum.ONE) {
  switch (action) {
    case LogoutActionEnum.ONE:
      await revokeToken(payload);
      break;

    case LogoutActionEnum.ALL:
      user.changeCredentialTime = new Date();
      await user.save();
      const userTokenKeys = await getAllKeys(
        getBaseUserRevokeTokenKey(payload.sub),
      );
      // Redis DEL with an empty list fails, so only delete when there are keys
      if (userTokenKeys.length) {
        await delKey(userTokenKeys);
      }
      break;
    default:
      break;
  }
}

export async function uploadProfilePic(user, file) {
  console.log("File path:", file?.path);
  console.log("Final path:", file?.finalPath);

  if (!file?.finalPath) {
    throw new Error("File finalPath is missing");
  }

  user.profilePicPath = file.finalPath;

  await user.save();

  console.log("Saved profile picture:", user.profilePicPath);

  return user;
}