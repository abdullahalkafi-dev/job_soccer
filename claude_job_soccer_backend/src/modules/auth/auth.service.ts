import { StatusCodes } from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";

import AppError from "../../errors/AppError";

import bcrypt from "bcryptjs";
import {
  LoginProvider,
  TAuthResetPassword,
  TChangePassword,
  TLoginData,
  TVerifyEmail,
} from "./auth.interface";
import { CandidateRole, EmployerRole, TBaseUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { Auth } from "./auth.model";
import { jwtHelper } from "../../shared/util/jwtHelper";
import config from "../../config";
import mongoose from "mongoose";
import { generateOTP } from "../../shared/util/generateOTP";
import { emailSender } from "../../shared/email/email.sender";
import { emailTemplate } from "../../shared/email/email.template";
import { OtpService } from "../oneTimeCode/otp.service";
import { ResetToken } from "../resetToken/resetToken.model";
import { generateCryptoToken } from "../../shared/util/generateCryptoToken";
import { OneTimeCode } from "../oneTimeCode/otp.model";

export type TCreateUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: CandidateRole | EmployerRole;
  password: string;
  loginProvider: LoginProvider;
};

const getUserType = (role: CandidateRole | EmployerRole): string => {
  if (Object.values(CandidateRole).includes(role as CandidateRole)) {
    return "candidate";
  } else if (Object.values(EmployerRole).includes(role as EmployerRole)) {
    return "employer";
  }
  throw new AppError(StatusCodes.BAD_REQUEST, "Invalid user role");
};

// signup
const createUser = async (user: TCreateUser) => {
  // Use transaction to prevent race conditions
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existingUser = await User.findOne({ email: user.email }).session(
        session
      );

      if (user.loginProvider === LoginProvider.LINKEDIN) {
        if (existingUser) {
          // Return existing user for LinkedIn
          const accessToken = jwtHelper.createToken(
            {
              id: existingUser._id,
              role: existingUser.role,
              email: existingUser.email,
              userType: existingUser.userType,
            },
            (config.jwt.jwt_secret as Secret) || "JWT_SECRET",
            config.jwt.jwt_expire_in || "1d"
          );
          return { accessToken, user: existingUser };
        }

        const authEntry = await Auth.create(
          [
            {
              email: user.email,
              password: "",
              loginProvider: user.loginProvider,
            },
          ],
          { session }
        );

        if (!authEntry[0]) {
          throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Auth creation failed"
          );
        }

        const userType = getUserType(user.role);

        const newUser = await User.create(
          [
            {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              userType: userType,
              isVerified: true,
              authId: authEntry[0]._id,
            },
          ],
          { session }
        );

        if (!newUser[0]) {
          throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "User creation failed"
          );
        }

        const accessToken = jwtHelper.createToken(
          {
            id: newUser[0]._id,
            role: newUser[0].role,
            email: newUser[0].email,
            userType: newUser[0].userType,
          },
          (config.jwt.jwt_secret as Secret) || "JWT_SECRET",
          config.jwt.jwt_expire_in || "1d"
        );

        return { accessToken, user: newUser[0] };
      } else {
        // Email provider flow
        if (existingUser && existingUser.isVerified === true) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            "User already exists with email"
          );
        }

        if (existingUser?.isVerified === false) {
          // Delete the existing unverified user and auth
          await Promise.all([
            User.findByIdAndDelete(existingUser._id).session(session),
            Auth.findByIdAndDelete(existingUser.authId).session(session),
            OneTimeCode.findOneAndDelete({
              userId: existingUser._id.toString(),
            }).session(session),
          ]);
        }

        const hashPassword = await bcrypt.hash(
          user.password,
          Number(process.env.BCRYPT_SALT_ROUNDS) || 12
        );

        const authEntry = await Auth.create(
          [
            {
              email: user.email,
              password: hashPassword,
              loginProvider: user.loginProvider || LoginProvider.EMAIL,
            },
          ],
          { session }
        );

        if (!authEntry[0]) {
          throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Auth creation failed"
          );
        }

        const userType = getUserType(user.role);

        const newUser = await User.create(
          [
            {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              userType: userType,
              authId: authEntry[0]._id,
            },
          ],
          { session }
        );

        if (!newUser[0]) {
          throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "User creation failed"
          );
        }
        const accessToken = jwtHelper.createToken(
          {
            id: newUser[0]._id,
            role: newUser[0].role,
            email: newUser[0].email,
            userType: newUser[0].userType,
          },
          (config.jwt.jwt_secret as Secret) || "JWT_SECRET",
          config.jwt.jwt_expire_in || "1d"
        );

        const otp = generateOTP();
        console.log(otp, "otp");
        const emailHtml = emailTemplate.createAccount({
          email: newUser[0].email,
          name: newUser[0].firstName,
          otp: otp,
          theme: "theme-green",
          expiresIn: 30,
        });
        await OtpService.createOtpEntry({
          userId: newUser[0]._id.toString(),
          expireAt: new Date(Date.now() + 30 * 60000),
          oneTimeCode: otp,
          reason: "account_verification",
        });

        emailSender.sendEmail(emailHtml);
        return { user: newUser[0], accessToken };
      }
    });
  } finally {
    await session.endSession();
  }
};

// login
const loginUser = async (payload: TLoginData) => {
  const { email, password, loginProvider } = payload;

  if (loginProvider === LoginProvider.LINKEDIN) {
    // For LinkedIn, we just want to ensure user exists and return token
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // User exists, return token
      const accessToken = jwtHelper.createToken(
        {
          id: existingUser._id,
          role: existingUser.role,
          email: existingUser.email,
          userType: existingUser.userType,
        },
        (config.jwt.jwt_secret as Secret) || "JWT_SECRET",
        config.jwt.jwt_expire_in || "1d"
      );
      return { accessToken, user: existingUser };
    } else {
      if (!payload.role) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "Role is required for LinkedIn signup"
        );
      }

      const createUserPayload: TCreateUser = {
        firstName: payload.firstName || "",
        lastName: payload.lastName || "",
        email,
        role: payload.role,
        loginProvider: LoginProvider.LINKEDIN,
        password: "",
      };

      return createUser(createUserPayload);
    }
  }

  if (loginProvider === LoginProvider.EMAIL) {
    if (!password) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Password is required");
    }
    const auth = await Auth.findOne({ email });
    const isExistingUser = await User.findOne({ email });

    if (!isExistingUser || !auth) {
      throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    const hashedPassword = auth.password;
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword!);

    if (!isPasswordMatch) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Password is incorrect!");
    }

    const accessToken = jwtHelper.createToken(
      {
        id: isExistingUser._id,
        role: isExistingUser.role,
        email: isExistingUser.email,
        userType: isExistingUser.userType,
      },
      (config.jwt.jwt_secret as Secret) || "JWT_SECRET",
      config.jwt.jwt_expire_in || "1d"
    );
    return { accessToken, user: isExistingUser };
  }
};

const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.findOne({ email });
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  console.log(otp, "otp");
  const value = {
    otp,
    email: isExistUser.email,
    name: isExistUser.firstName!,
    expiresIn: 30,
    theme: "theme-red" as
      | "theme-green"
      | "theme-red"
      | "theme-purple"
      | "theme-orange"
      | "theme-blue",
  };
  const forgetPassword = emailTemplate.resetPassword(value);

  emailSender.sendEmail(forgetPassword);

  //save to DB
  await OtpService.createOtpEntry({
    userId: isExistUser._id.toString(),
    expireAt: new Date(Date.now() + 30 * 60000),
    oneTimeCode: otp,
    reason: "password_reset",
  });
  return { message: "OTP sent to your email" };
};

//verify email
const verifyEmailToDB = async (payload: TVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  console.log(oneTimeCode, "new code");
  const isExistUser = await User.findOne({ email });
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please give the otp, check your email we send a code"
    );
  }
  const isOtpValid = await OtpService.validateOtp({
    userId: isExistUser._id.toString(),
    oneTimeCode,
    reason: payload.reason || "account_verification",
  });
  if (!isOtpValid) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid or expired OTP");
  }
  //create token ;

  let data = null;
  let message = "Account verified successfully";
  if (payload.reason != "account_verification") {
    const createToken = generateCryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 30 * 60000),
    });
    message =
      "Verification Successful: Please securely store and utilize this code for reset password";
    data = createToken;
  } else {
    await User.findByIdAndUpdate(isExistUser._id, { isVerified: true });
  }

  return { data, message };
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: TAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const resetToken = await ResetToken.isExistToken(token);
  if (!resetToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Token expired, Please click again to the forget password"
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };

  const userId = resetToken.user;
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!isExistUser.authId) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Auth entry missing for user"
    );
  }
  await Auth.findByIdAndUpdate(isExistUser.authId, updateData, { new: true });
  // Invalidate the reset token after successful use
  await ResetToken.findOneAndDelete({ token });

  return { message: "Password reset successfully" };
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: TChangePassword
) => {
  console.log(user,payload);
  const { currentPassword, newPassword } = payload;
  const isExistUser = await User.findById(user.id).select("authId");
  const authEntry = await Auth.findById(isExistUser?.authId);
  if (!isExistUser || !authEntry) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  //check current password is correct
  const isPasswordMatched = bcrypt.compare(
    currentPassword,
    authEntry?.password!
  );
  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.BAD_REQUEST, "incorrect current password");
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please give different password from current password"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds || 12)
  );

  const updateData = {
    password: hashPassword,
  };
  await Auth.findByIdAndUpdate(authEntry._id, updateData, { new: true });
  //TODO: send email notification about password change

  return null;
};

const deleteAccountToDB = async (user: JwtPayload) => {
  const result = await User.findByIdAndUpdate(
    user.id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "No User found");
  }
  return null;
};

//resend otp
const resendOtp = async ({
  email,
  reason,
}: {
  email: string;
  reason: string;
}) => {
  const isExistUser = await User.findOne({
    email,
  });
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  console.log(otp, "otp");
  const value = {
    otp,
    email: isExistUser.email,
    name: isExistUser.firstName!,
    theme: "theme-blue" as
      | "theme-green"
      | "theme-red"
      | "theme-purple"
      | "theme-orange"
      | "theme-blue",
    expiresIn: 30,
  };
  if (reason === "account_verification") {
    const createAccount = emailTemplate.createAccount(value);
    emailSender.sendEmail(createAccount);
  }
  if (reason === "password_reset") {
    const resetPassword = emailTemplate.resetPassword(value);
    emailSender.sendEmail(resetPassword);
  }

  //save to DB
  await OtpService.createOtpEntry({
    userId: isExistUser._id.toString(),
    expireAt: new Date(Date.now() + 30 * 60000),
    oneTimeCode: otp,
    reason: reason as "account_verification" | "password_reset",
  });
  return null;
};

export const AuthService = {
  createUser,
  verifyEmailToDB,
  loginUser,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  deleteAccountToDB,
  resendOtp,
};
