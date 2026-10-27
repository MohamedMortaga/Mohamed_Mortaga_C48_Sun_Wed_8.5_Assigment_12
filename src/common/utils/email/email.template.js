import { EmailSubjectEnum } from "../../enum/email.enum.js";

export const EmailTemplate = {
  [EmailSubjectEnum.CONFIRM_EMAIL]: (code) => {
    return `
        <!DOCTYPE html>

        <html>
            <body>

                <h1>Confirm Your Email</h1>

                <p>
                    Your verification code is:
                </p>

                <h2>${code}</h2>

                <p>
                    This code expires in 3 minutes.
                </p>

            </body>
        </html>
    `;
  },
  [EmailSubjectEnum.FORGET_PASSWORD]: (code) => {
    return `
        <!DOCTYPE html>

        <html>
            <body>

                <h1>Reset Your Password</h1>

                <p>
                    Your verification code is:
                </p>

                <h2>${code}</h2>

                <p>
                    This code expires in 3 minutes.
                </p>

            </body>
        </html>
    `;
  }
};
