import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import UserCacheManage from "./user.cacheManage";
import { User } from "./user.model";
import { AuthService } from "../auth/auth.service";
import { TBaseUser } from "./user.interface";


const getAllUsers = async (
  query: Record<string, unknown>
): Promise<TReturnUser.getAllUser> => {
  const cached = await UserCacheManage.getCacheListWithQuery(query);
  if (cached) return cached;

  const userQuery = new QueryBuilder(User.find(), query)
    .search(["firstName", "lastName", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  await UserCacheManage.setCacheListWithQuery(query, { result, meta });

  return { result, meta };
};
const getUserById = async (
  id: string
): Promise<Partial<TReturnUser.getSingleUser>> => {
  // First, try to retrieve the user from cache.
  const cachedUser = await UserCacheManage.getCacheSingleUser(id);
  if (cachedUser) return cachedUser;
  // If not cached, query the database using lean with virtuals enabled.
  const user = await User.findById(id).populate("address").lean({
    virtuals: true,
  });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  // Cache the freshly retrieved user data.
  await UserCacheManage.setCacheSingleUser(id, user);
  return user;
};
const updateUser = async (
  id: string,
  updateData: Partial<TReturnUser.updateUser>
): Promise<Partial<TReturnUser.updateUser>> => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (updateData.image && user.image) {
        unlinkFileSync(user.image);
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User update failed");
  }
  //remove cache
  await UserCacheManage.updateUserCache(id);

  //set new cache
  UserCacheManage.setCacheSingleUser(id, updatedUser);
  return updatedUser;
};
const updateUserActivationStatus = async (
  id: string,
  status: "active" | "delete"
): Promise<TReturnUser.updateUserActivationStatus> => {
  console.log(status);
  console.log(id);

  const user = await User.findByIdAndUpdate(
    id,
    { status: status },
    { new: true }
  );
  console.log(user);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  //remove cache
  await UserCacheManage.updateUserCache(id);

  //set new cache
  // UserCacheManage.setCacheSingleUser(id, user);
  return user;
};
const updateUserRole = async (
  id: string,
  role: "USER" | "ADMIN"
): Promise<Partial<TReturnUser.updateUserRole>> => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true }
  );
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  //remove cache
  await UserCacheManage.updateUserCache(id);

  //set new cache
  // UserCacheManage.setCacheSingleUser(id, user);
  return user;
};

const getMe = async (
  userId: string
): Promise<Partial<TReturnUser.getSingleUser>> => {
  // First, try to retrieve the user from cache.
  const cachedUser = await UserCacheManage.getCacheSingleUser(userId);
  if (cachedUser) return cachedUser;

  // If not cached, query the database using lean with virtuals enabled.
  const user = await User.findById(userId).populate("address").lean({
    virtuals: true,
  });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  // Cache the freshly retrieved user data.
  await UserCacheManage.setCacheSingleUser(userId, user);
  return user;
};

const updateFcmToken = async (userId: string, fcmToken: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { fcmToken },
    { new: true }
  );
  
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  
  // Update cache
  await UserCacheManage.setCacheSingleUser(userId, user);
  
  return { fcmToken: user.fcmToken };
};

export const UserServices = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserActivationStatus,
  updateUserRole,
  getMe,
  updateFcmToken,
};
