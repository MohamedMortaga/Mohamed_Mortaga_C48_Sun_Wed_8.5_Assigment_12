import { SystemLanguageEnum } from "./enum/system.enum.js";

export const messages = {
  [SystemLanguageEnum.EN]: {
    validationFailed: "Validation Failed",
    username: {
      required: "Username is required",
      invalid: "Username must be a string",
      min: "Username must be at least 2 characters",
      max: "Username must be at most 50 characters",
      pattern:
        "Username must be a first and last name (letters only, each at least 2 letters, separated by one space)",
    },
    email: {
      required: "Email is required",
      invalid: "Email Must Follow This Pattern email@domain.com",
    },
    password: {
      required: "Password is required",
      invalid: "Password must be a string",
      pattern:
        "Password must be 8-16 characters with an uppercase letter, a lowercase letter, a number and a special character (!@#$%^&* or space)",
    },
    confirmPassword: {
      required: "Confirm Password is required",
      invalid: "Confirm Password must be a string",
      mismatch: "Confirm Password Miss Match Password",
    },
    phone: {
      required: "Phone is required",
      invalid: "Phone must be in international format like +201012345678",
    },
    gender: {
      invalid: "Gender must be 0 (male) or 1 (female)",
    },
    DOB: {
      invalid: "DOB must be a valid date",
    },
    otp: {
      required: "OTP is required",
      invalid: "OTP must be exactly 6 digits",
    },
  },

  [SystemLanguageEnum.AR]: {
    validationFailed: "فشل التحقق من البيانات",
    username: {
      required: "اسم المستخدم مطلوب",
      invalid: "اسم المستخدم يجب أن يكون نصاً",
      min: "اسم المستخدم يجب أن يكون حرفين على الأقل",
      max: "اسم المستخدم يجب ألا يزيد عن 50 حرفاً",
      pattern:
        "اسم المستخدم يجب أن يكون اسماً أول واسم عائلة (حروف فقط، كل كلمة حرفان على الأقل، بينهما مسافة واحدة)",
    },
    email: {
      required: "البريد الإلكتروني مطلوب",
      invalid: "يجب أن يتبع البريد الإلكتروني هذا النمط email@domain.com",
    },
    password: {
      required: "كلمة المرور مطلوبة",
      invalid: "كلمة المرور يجب أن تكون نصاً",
      pattern:
        "كلمة المرور يجب أن تكون من 8 إلى 16 حرفاً وتحتوي على حرف كبير وحرف صغير ورقم ورمز خاص (!@#$%^&* أو مسافة)",
    },
    confirmPassword: {
      required: "تأكيد كلمة المرور مطلوب",
      invalid: "تأكيد كلمة المرور يجب أن يكون نصاً",
      mismatch: "تأكيد كلمة المرور لا يطابق كلمة المرور",
    },
    phone: {
      required: "رقم الهاتف مطلوب",
      invalid: "رقم الهاتف يجب أن يكون بالصيغة الدولية مثل +201012345678",
    },
    gender: {
      invalid: "النوع يجب أن يكون 0 (ذكر) أو 1 (أنثى)",
    },
    DOB: {
      invalid: "تاريخ الميلاد يجب أن يكون تاريخاً صحيحاً",
    },
    otp: {
      required: "رمز التحقق مطلوب",
      invalid: "رمز التحقق يجب أن يكون 6 أرقام",
    },
  },
};

// Messages for the request language (falls back to English).
export function getMessages(lang) {
  return messages[lang] || messages[SystemLanguageEnum.EN];
}
