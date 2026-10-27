import { Router } from "express";
import {
  confirmEmail,
  login,
  otpTimeLeft,
  resendConfirmEmail,
  resetPassword,
  sendOtpForgetPassword,
  signup,
  signupOrLoginWithGoogle,
  verifyForgetPasswordOTP,
} from "./auth.service.js";
import { successResponse } from "../../common/response/success.response.js";
import validation from "../../middleware/validation.middleware.js";
import {
  confirmEmailSchema,
  loginSchema,
  resendOtpSchema,
  resetPasswordSchema,
  sendForgetPasswordOtpSchema,
  signupSchema,
  verifyForgetPasswordOTPSchema,
} from "./auth.validation.js";
const authRouter = Router();

authRouter.post("/signup", validation(signupSchema), async (req, res) => {
  const result = await signup(req.body);

  successResponse({ res, message: "created", data: result, status: 201 });
});

authRouter.post("/login", validation(loginSchema), async (req, res) => {
  console.log({ "req.validateData": req.validateData });

  const result = await login(req.validateData.body);

  successResponse({ res, data: result });
});

authRouter.post(
  "/loginWithGmail",
  // validation(loginSchema),
  async (req, res) => {
  // console.log({ "req.body": req.body });

  const { tokens, statusCode } = await signupOrLoginWithGoogle(req.body.idToken);
  successResponse({ res, status: statusCode, data: tokens });
  },
);

authRouter.patch(
  "/confirm-email",
  validation(confirmEmailSchema),
  async (req, res) => {
    const result = await confirmEmail(req.validateData.body);

    successResponse({ res, data: result });
  },
);

authRouter.post(
  "/verify-forget-password-otp",
  validation(verifyForgetPasswordOTPSchema),
  async (req, res) => {
    await verifyForgetPasswordOTP(req.validateData.body);

    successResponse({ res });
  },
);

authRouter.patch(
  "/reset-password",
  validation(resetPasswordSchema),
  async (req, res) => {
    await resetPassword(req.validateData.body);

    successResponse({ res });
  },
);

authRouter.post(
  "/send-otp-forget-password",
  validation(sendForgetPasswordOtpSchema),
  async (req, res) => {
    const result = await sendOtpForgetPassword(req.validateData.body.email);

    successResponse({ res, data: result });
  },
);

authRouter.post(
  "/resend-otp",
  validation(resendOtpSchema),
  async (req, res) => {
    const result = await resendConfirmEmail(req.validateData.body.email);

    successResponse({ res, data: result });
  },
);

// POST /auth/otp-time-left  { email }  -> seconds left before the OTP expires (Redis TTL)
authRouter.post(
  "/otp-time-left",
  validation(resendOtpSchema),
  async (req, res) => {
    const result = await otpTimeLeft(req.validateData.body);

    successResponse({ res, data: result });
  },
);

export default authRouter;
