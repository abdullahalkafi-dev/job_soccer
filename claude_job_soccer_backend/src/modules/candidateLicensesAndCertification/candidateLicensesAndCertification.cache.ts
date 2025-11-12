import {
  getCache,
  setCache,
  deleteCache,
  invalidateByPattern,
} from "../../shared/redis/cacheService";

// Cache key constants
const CACHE_PREFIX = "candidateLicensesAndCertification";
const CACHE_TTL = 3600; // 1 hour in seconds

// Helper function to generate cache keys
const getCacheKey = {
  byUser: (userId: string) => `${CACHE_PREFIX}:user:${userId}`,
  byId: (licenseId: string) => `${CACHE_PREFIX}:id:${licenseId}`,
  byUsers: (userIds: string[]) =>
    `${CACHE_PREFIX}:users:${userIds.sort().join(",")}`,
};

// Helper function to invalidate user's cache
const invalidateUserCache = async (userId: string): Promise<void> => {
  try {
    // Delete specific user cache
    await deleteCache(getCacheKey.byUser(userId));
    // Invalidate any bulk queries that might include this user
    await invalidateByPattern(`${CACHE_PREFIX}:users:*`);
  } catch (error) {
    console.error(`Error invalidating cache for user ${userId}:`, error);
    // Don't throw error - cache invalidation failure shouldn't break the operation
  }
};
export const candidateLicensesAndCertificationCache = {
  CACHE_PREFIX,
  CACHE_TTL,
  getCacheKey,
  invalidateUserCache,
  getCache,
  setCache,
  deleteCache,
  invalidateByPattern,
};
