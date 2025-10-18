import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";


const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { ...verifyData } = req.body;

  const result = await AuthService.verifyEmailToDB(verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result: any = await AuthService.loginUserFromDB(loginData);

  res.cookie("refreshToken", result.refreshToken, {
    secure: config.node_env === "production",
    httpOnly: true,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User login successfully",
    data: result,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  const result = await AuthService.forgetPasswordToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Please check your email, we send a OTP!",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { ...resetData } = req.body;
  const result = await AuthService.resetPasswordToDB(token!, resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password reset successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;
  await AuthService.changePasswordToDB(user, passwordData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password changed successfully",
  });
});

const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await AuthService.deleteAccountToDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Account Deleted successfully",
    data: result,
  });
});
const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  const result = await AuthService.resendOtp(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Please check your email, we send a OTP!",
    data: result,
  });
}
);

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await AuthService.logoutUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Logged out successfully",
    data: result,
  });
});

export const AuthController = {
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
  deleteAccount,
  resendOtp,
  logoutUser,
};
