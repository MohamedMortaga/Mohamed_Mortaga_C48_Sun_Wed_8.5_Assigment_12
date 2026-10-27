import { unlink } from "fs/promises";

import {
  processFiles,
  processFields,
  processFile,
} from "../../src/common/utils/multer/multer.service.js";

export function checkFileContent({ acceptedFileTypes = [], folderName }) {
  return async (req, res, next) => {
    try {
      if (req.file) {
        await processFile(req.file, acceptedFileTypes, folderName);
      } else if (Array.isArray(req.files)) {
        await processFiles(req.files, acceptedFileTypes, folderName);
      } else if (req.files && typeof req.files === "object") {
        await processFields(req.files, acceptedFileTypes, folderName);
      }

      next();
    } catch (error) {
      // Collect all uploaded files
      const files = req.file
        ? [req.file]
        : Array.isArray(req.files)
          ? req.files
          : Object.values(req.files || {}).flat();

      // Delete all uploaded files
      await Promise.allSettled(
        files.flatMap((file) =>
          [...new Set([file.path, file.finalPath].filter(Boolean))].map(
            (path) => unlink(path),
          ),
        ),
      );

      next(error);
    }
  };
}

export function handleFileMiddleware({
  multerMiddleware,
  folderName = "User",
  acceptedFileTypes = [],
} = {}) {
  return (req, res, next) => {
    const customNext = (error) => {
      if (error) {
        return next(error);
      }

      return checkFileContent({
        folderName,
        acceptedFileTypes,
      })(req, res, next);
    };

    return multerMiddleware(req, res, customNext);
  };
}