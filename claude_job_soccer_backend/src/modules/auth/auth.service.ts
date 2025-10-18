import { StatusCodes } from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";

import AppError from "../../errors/AppError";

import bcrypt from "bcryptjs";
import { LoginProvider, TLoginData } from "./auth.interface";
import { TBaseUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { Auth } from "./auth.model";
import auth from "../../shared/middlewares/auth";

export type TCreateUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  loginProvider: LoginProvider;
};

// signup
const createUser = async (user: TCreateUser): Promise<TBaseUser> => {
  /*
  1. check login provider
  if (user.loginProvider === "linkedin") {
    create user directly or if exist login send access token
  }
  2. check existing user by email
  3. if exist and not verified than delete the (user and auth)
  4. if exist and verified than throw error user exist
  5. create auth entry
  6. create user entry
  7. send otp to email
*/

  if (user.loginProvider === LoginProvider.LINKEDIN) {
    //TODO: implement linkedin login flow
    console.log("Linkedin login flow");
  } else {
    console.log("Email signup flow");
    //check existing user by email
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser?.isVerified === false) {
      //delete the existing user and auth
      await User.findByIdAndDelete(existingUser._id);
      await Auth.findByIdAndDelete(existingUser.authId);
    }
    // Check if the user already exists with verified
    if (existingUser && existingUser.isVerified === true) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "User already exists with email"
      );
    }
    const authEntry = await Auth.create({
      email: user.email,
      password: user.password,
      loginProvider: user.loginProvider
    });
  }
  //! --------------------------

  const existingUser = await User.findOne({ email: user.email });
  if (existingUser?.isVerified === false) {
    //delete the existing user
    await User.findByIdAndDelete(existingUser._id);
  }

  const newUser = await User.create(user);
  if (!newUser) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "User creation failed"
    );
  }
  await AuthService.resendOtp(newUser.email);

  return newUser;
};

//login
const loginUserFromDB = async (payload: Partial<TLoginData>) => {
  const { email, password, fcmToken } = payload;
  console.log(payload);
  if (!password) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password is required");
  }

  const isExistUser = await User.findOne({ email }).select("+password");
  console.log(isExistUser);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //check user status
  if (isExistUser.status === "delete") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Your account has been deleted, Please contact with admin"
    );
  }

  //check match password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password is incorrect!");
  }

  // Update FCM token if provided
  if (fcmToken) {
    await User.findByIdAndUpdate(isExistUser._id, { fcmToken });
    console.log(`FCM token updated for user ${email}: ${fcmToken}`);
  }

  //create token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    "100y"
  );

  const { password: _, ...userWithoutPassword } = isExistUser.toObject();

  return { accessToken, user: userWithoutPassword };
};

const forgetPasswordToDB = async (email: string) => {
  const isExistUser: Partial<TUser> = await User.isExistUserByEmail(email);
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
    theme: "theme-red" as
      | "theme-green"
      | "theme-red"
      | "theme-purple"
      | "theme-orange"
      | "theme-blue",
    expiresIn: 15,
  };
  const forgetPassword = emailTemplate.resetPassword(value);

  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 15 * 60000),
  };

  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

//verify email
const verifyEmailToDB = async (payload: TVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  console.log(oneTimeCode, "new code");
  const isExistUser = await User.findOne({ email }).select("+authentication");
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please give the otp, check your email we send a code"
    );
  }
  console.log(isExistUser.authentication?.oneTimeCode, "old code");
  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new AppError(StatusCodes.BAD_REQUEST, "You provided wrong otp");
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Otp already expired, Please try again"
    );
  }

  let message;
  let data;

  await User.findOneAndUpdate(
    { _id: isExistUser._id },
    {
      verified: true,
      authentication: {
        isResetPassword: true,
        oneTimeCode: null,
        expireAt: null,
      },
    }
  );

  //create token ;
  const createToken = cryptoToken();
  await ResetToken.create({
    user: isExistUser._id,
    token: createToken,
    expireAt: new Date(Date.now() + 15 * 60000),
  });
  message =
    "Verification Successful: Please securely store and utilize this code for reset password";
  data = createToken;

  return { data, message };
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: TAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    "+authentication"
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
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
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: TChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select("+password");
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password is incorrect");
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please give different password from current password"
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });

  const value = {
    receiver: isExistUser._id,
    text: "Your password changed successfully",
  };
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
  await UserCacheManage.updateUserCache(user.id);

  return result;
};
//resend otp
const resendOtp = async (email: string) => {
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
  const createAccount = emailTemplate.createAccount(value);

  emailHelper.sendEmail(createAccount);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 30 * 60000),
  };

  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

const logoutUser = async (userId: string) => {
  // Remove FCM token on logout for security
  await User.findByIdAndUpdate(userId, { $unset: { fcmToken: 1 } });
  console.log(`User ${userId} logged out, FCM token removed`);
  return { message: "Logged out successfully" };
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  deleteAccountToDB,
  resendOtp,
  logoutUser,
};
