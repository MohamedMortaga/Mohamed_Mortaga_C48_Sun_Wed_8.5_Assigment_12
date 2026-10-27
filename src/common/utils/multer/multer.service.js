import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { resolve, extname } from "path";
import { fileTypeFromBuffer } from "file-type";
import { BadRequestException } from "../../exceptions/app.exceptions.js";
import { randomUUID } from "crypto";

export async function processFile(
  file,
  acceptedFileTypes = [],
  folderName = "general"
) {
  if (!file) return;

  const fileContent = file.path
    ? await readFile(resolve(file.path))
    : file.buffer;

  const actualFileType = await fileTypeFromBuffer(fileContent);

  // Files with no detectable signature (e.g. .txt) are allowed only when no types are restricted
  if (acceptedFileTypes.length && (!actualFileType || !acceptedFileTypes.includes(actualFileType.mime))) {
    if (file.path) {
      await unlink(resolve(file.path));
    }

    throw BadRequestException({
      errMsg: "Invalid Actual File Format",
    });
  }

  if (file.path) {
    file.finalPath = file.path;
  } else {
    const dirPath = `./assets/${folderName}`;
    const ext = actualFileType?.ext || extname(file.originalname).slice(1) || "bin";
    const finalPath = `${dirPath}/${randomUUID()}.${ext}`;

    await mkdir(dirPath, { recursive: true });
    await writeFile(resolve(finalPath), fileContent);

    file.finalPath = finalPath;
  }

  return file;
}

export async function processFiles(
  files,
  acceptedFileTypes = [],
  folderName
) {
  for (const file of files) {
    await processFile(file, acceptedFileTypes, folderName);
  }
}

export async function processFields(
  fields,
  acceptedFileTypes = [],
  folderName
) {
  for (const key of Object.keys(fields)) {
    await processFiles(fields[key], acceptedFileTypes, folderName);
  }
}