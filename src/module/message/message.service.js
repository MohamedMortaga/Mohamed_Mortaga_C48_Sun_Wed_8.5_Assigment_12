import {
  NotFoundException,
  BadRequestException,
} from "../../common/exceptions/app.exceptions.js";
import {
  findByIdDoc,
  findOneDoc,
  createDoc,
  deleteDoc,
  findAllDoc
} from "../../DB/db.repo.js";
import userModel from "../../DB/model/user.model.js";
import messageModel from "../../DB/model/message.model.js";
import { isValidObjectId } from "mongoose";

export async function sendMessage(bodyData, filesData = [], user) {
  const { content, receiverId } = bodyData;

  if (!content?.trim() && !filesData.length) {
    throw BadRequestException({
      errMsg: "Message content or attachments are required",
    });
  }

  if (!isValidObjectId(receiverId)) {
    throw NotFoundException({
      errMsg: "Receiver Not Found",
    });
  }

  const receiver = await findByIdDoc({
    model: userModel,
    id: receiverId,
  });

  if (!receiver) {
    throw NotFoundException({
      errMsg: "Account Not Found",
    });
  }

  const finalPaths = filesData.map((file) => file.finalPath);

  const [newMessage] = await createDoc({
    model: messageModel,
    insertedData: {
      content,
      attachments: finalPaths,
      senderId: user?.id,
      receiverId,
    },
  });

  return newMessage;
}

export async function deleteMessage(messageId, user) {
  if (!isValidObjectId(messageId)) {
    throw NotFoundException({
      errMsg: "Message Not Found",
    });
  }

  const message = await deleteDoc({
    model: messageModel,
    filter: {
      _id: messageId,
      $or: [{ receiverId: user.id }, { senderId: user.id }],
    },
  });

  if (!message.deletedCount) {
    throw NotFoundException({
      errMsg: "Message Not Found",
    });
  }
}

export async function getMessageById(messageId, user) {
  if (!isValidObjectId(messageId)) {
    throw NotFoundException({ errMsg: "Message Not Found" });
  }

  const message = await findOneDoc({
    model: messageModel,
    filter: {
      _id: messageId,
      $or: [{ receiverId: user.id }, { senderId: user.id }],
    },
  });

  if (!message) {
    throw NotFoundException({ errMsg: "Message Not Found" });
  }
  return message;
}

export async function getAllMessages(user, { page = 1, limit = 5 } = {}) {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.max(Number(limit) || 5, 1);

  const messages = await findAllDoc({
    model: messageModel,
    filter: {
      $or: [{ receiverId: user.id }, { senderId: user.id }],
    },
    pagination: { page, limit },
  });

  return messages;
}
