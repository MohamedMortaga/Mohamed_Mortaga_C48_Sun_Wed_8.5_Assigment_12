import * as z from "zod";
import { SystemLanguageEnum } from "../common/enum/system.enum.js";
import { BadRequestException } from "../common/exceptions/app.exceptions.js";
import { getMessages } from "../common/messages.js";

function validation(schema) {
  return (req, res, next) => {
    const language = req.headers["accept-language"] || SystemLanguageEnum.EN;

    const validateData = schema(language).safeParse(
      {
        body: req.body,
        params: req.params,
        query: req.query,
      },
      {
        error:
          language == SystemLanguageEnum.AR
            ? z.locales.ar().localeError
            : z.locales.en().localeError,
      },
    );

    if (!validateData.success) {
      throw BadRequestException({
        errMsg: getMessages(language).validationFailed,
        cause: {
          issues: validateData.error.issues,
        },
      });
    }

    req.validateData = validateData.data;
    next();
  };
}

export default validation;
