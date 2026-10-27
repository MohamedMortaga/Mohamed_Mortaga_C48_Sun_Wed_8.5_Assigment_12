import { Router } from "express";
import { TokenTypeEnum } from "../../common/enum/token.enum.js";
import { successResponse } from "../../common/response/success.response.js";
import { logout, rotateToken } from "./user.service.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import auth from "../../middleware/authentication.middleware.js";
import authorization from "../../middleware/authorization.middleware.js";
import { FileTypesEnum } from "../../common/enum/multer.enum.js";
import { checkFileContent } from "../../middleware/multer.middleware.js";
import { handleFileMiddleware } from "../../middleware/multer.middleware.js";
import localUpload from "../../common/utils/multer/multer.config.js";
import { uploadProfilePic } from "./user.service.js";

const userRouter = Router();

userRouter.get(
  "/get-profile",
  auth(),
  // authorization([RoleEnum.ADMIN]),

  async (req, res) => {
    successResponse({ res, data: { user: req.user, payload: req.payload } });
  },
);

userRouter.post(
  "/rotate-token",
  auth(TokenTypeEnum.REFRESH),
  async (req, res) => {
    const result = await rotateToken(req.payload, req.user);

    successResponse({ res, data: result });
  },
);

userRouter.post("/logout", auth(), async (req, res) => {
  const result = await logout(req.payload, req.user, req.body?.action);

  successResponse({ res, data: result });
});

userRouter.post(
  "/upload-profile-pic",
  auth(),
  // localupload({ acceptedFileTypes: FileTypesEnum.image, filesize: 100 }).single(
  //   "profile-pic",
  // ),
  handleFileMiddleware({
    multerMiddleware: localUpload({ acceptedFileTypes: FileTypesEnum.image,
      fileSize: 100,
      folderName: "User",
    }).single("profile-pic"),
    acceptedFileTypes: FileTypesEnum.image,
  }),
  async (req, res) => {
    await uploadProfilePic(req.user, req.file);
     successResponse({
      res,
      // data: {
      //   "req.body": req.body,
      //   "req.file": req.file,
      //   "req.files": req.files,
      // },
    });
  },
);

export default userRouter;
