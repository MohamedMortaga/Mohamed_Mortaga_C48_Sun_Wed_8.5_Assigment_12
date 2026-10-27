import { Router } from "express";
import { unlink } from "fs/promises";
import auth from "../../middleware/authentication.middleware.js";
import { handleFileMiddleware } from "../../middleware/multer.middleware.js";
import localUpload from "../../common/utils/multer/multer.config.js";
import { successResponse } from "../../common/response/success.response.js";
import {
  sendMessage,
  deleteMessage,
  getMessageById,getAllMessages
} from "./message.service.js";

const messageRouter = Router();

// Send Message
messageRouter.post(
  "/",
  (req, res, next) => {
    if (req.headers.authorization) {
      return auth()(req, res, next);
    }

    next();
  },

  handleFileMiddleware({
    multerMiddleware: localUpload({
      fileSize: 5,
      folderName: "messages",
    }).any(),
    folderName: "messages",
  }),

  async (req, res) => {
    let result;
    try {
      result = await sendMessage(req.body, req.files, req.user);
    } catch (error) {
      // Remove uploaded files if the message was not created
      await Promise.allSettled(
        (req.files || [])
          .map((file) => file.finalPath || file.path)
          .filter(Boolean)
          .map((path) => unlink(path)),
      );
      throw error;
    }

    successResponse({
      res,
      status: 201,
      data: result,
    });
  },
);

// Get All Messages
messageRouter.get("/all-messages", auth(), async (req, res) => {
  const result = await getAllMessages(req.user, req.query);

  successResponse({
    res,
    data: result,
  });
});

// Get Message By ID
messageRouter.get("/:messageId", auth(), async (req, res) => {
  const result = await getMessageById(req.params.messageId, req.user);

  successResponse({
    res,
    data: result,
  });
});

// Delete Message
messageRouter.delete("/:messageId", auth(), async (req, res) => {
  await deleteMessage(req.params.messageId, req.user);

  successResponse({ res });
});
export default messageRouter;