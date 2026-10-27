import mongoose from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../common/enum/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName is required"],
      minLength: [2, "firstName must be at least 2 characters"],
      maxLength: [50, "firstName must be at most 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "lastName is required"],
      minLength: [2, "lastName must be at least 2 characters"],
      maxLength: [50, "lastName must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    phone: String,
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },

    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },

    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },

    DOB: Date,
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    profilePicPath: String,
    coverPicsPath: [String],
    deletedAt: Date,
    changeCredentialTime: Date,
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
      virtuals: true,
      // never send the password hash back to the client
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema
  .virtual("username")
  .get(function () {
    return `${this.get("firstName")} ${this.get("lastName")}`;
  })
  .set(function (value) {
    const [firstName, ...lastName] = value.split(" ");
    this.set({ firstName, lastName: lastName.join(" ") });
  });

// DOB => age
userSchema.virtual("age").get(function () {
  const DOB = this.get("DOB");
  if (!DOB) return undefined;
  const now = new Date();
  let age = now.getFullYear() - DOB.getFullYear();
  const birthdayPassed =
    now.getMonth() > DOB.getMonth() || (now.getMonth() === DOB.getMonth() && now.getDate() >= DOB.getDate());
  if (!birthdayPassed) age--;
  return age;
});

const userModel = mongoose.models.Users || mongoose.model("Users", userSchema);
export default userModel;
