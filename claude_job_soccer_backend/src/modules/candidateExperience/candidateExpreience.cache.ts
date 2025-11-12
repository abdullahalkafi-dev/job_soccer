import { getCache, setCache, deleteCache, invalidateByPattern } from "../../shared/redis/cacheService";

// Cache key constants
const CACHE_PREFIX = "candidateExperience";
const CACHE_TTL = 3600; // 1 hour in seconds

// Helper function to generate cache keys
const getCacheKey = {
  byUser: (userId: string) => `${CACHE_PREFIX}:user:${userId}`,
  byId: (experienceId: string) => `${CACHE_PREFIX}:id:${experienceId}`,
  byUsers: (userIds: string[]) => `${CACHE_PREFIX}:users:${userIds.sort().join(",")}`,
  byProfile: (profileId: string) => `${CACHE_PREFIX}:profile:${profileId}`,
};

// Helper function to invalidate user's cache
const invalidateUserCache = async (userId: string, profileId?: string): Promise<void> => {
  try {
    // Delete specific user cache
    await deleteCache(getCacheKey.byUser(userId));
    // Delete profile cache if provided
    if (profileId) {
      await deleteCache(getCacheKey.byProfile(profileId));
    }
    // Invalidate any bulk queries that might include this user
    await invalidateByPattern(`${CACHE_PREFIX}:users:*`);
  } catch (error) {
    console.error(`Error invalidating cache for user ${userId}:`, error);
    // Don't throw error - cache invalidation failure shouldn't break the operation
  }
};


export const candidateExperienceCache ={
    getCache,
    setCache,
    deleteCache,
    invalidateByPattern,
    getCacheKey,
    invalidateUserCache,
    CACHE_TTL,
};