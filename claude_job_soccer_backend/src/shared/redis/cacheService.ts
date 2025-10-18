// cacheService.ts
import { logger } from "../logger/logger";
import redisClient from "./redisClient";

// Cache service functions
const setCache = async (
  key: string,
  value: any,
  expiryInSec: number = 3600
): Promise<void> => {
  try {
    let stringifiedValue = JSON.stringify(value);

    // Size check
    if (stringifiedValue.length > 10 * 1024 * 1024) { // 10MB
      console.warn(
        `Cache object too large, skipping: ${key} (${stringifiedValue.length} bytes)`
      );
      return;
    }

    await redisClient.set(key, stringifiedValue, expiryInSec);
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
    throw error;
  }
};

const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const startTime = Date.now();
    const data = await redisClient.get(key);
    const duration = Date.now() - startTime;

    if (duration > 100) {
      logger.info(`Slow cache get operation: ${key} took ${duration}ms`);
    }

    if (data) {
      return JSON.parse(data) as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

const getMultipleCache = async <T>(keys: string[]): Promise<Map<string, T | null>> => {
  const result = new Map<string, T | null>();

  if (keys.length === 0) return result;

  try {
    const startTime = Date.now();
    const pipeline = redisClient.pipeline();
    
    keys.forEach(key => pipeline.get(key));
    const results = await pipeline.exec();
    const duration = Date.now() - startTime;

    if (duration > 100) {
      console.warn(
        `Slow batch cache get: ${keys.length} keys took ${duration}ms`
      );
    }

    keys.forEach((key, index) => {
      const [, data] = results?.[index] || [null, null];
      if (data && typeof data === 'string') {
        try {
          result.set(key, JSON.parse(data) as T);
        } catch {
          result.set(key, null);
        }
      } else {
        result.set(key, null);
      }
    });
  } catch (error) {
    console.error("Batch cache get error:", error);
    keys.forEach(key => result.set(key, null));
  }

  return result;
};

const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
    throw error;
  }
};

const invalidateByPattern = async (pattern: string): Promise<void> => {
  try {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, scanKeys] = await redisClient.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      keys.push(...scanKeys);
    } while (cursor !== '0');

    if (keys.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        const pipeline = redisClient.pipeline();
        batch.forEach(key => pipeline.del(key));
        await pipeline.exec();
      }
    }
  } catch (error) {
    console.warn(`Error invalidating cache pattern ${pattern}:`, error);
    throw error;
  }
};

const cacheHealthCheck = async (): Promise<boolean> => {
  return await redisClient.healthCheck();
};

export {
  setCache,
  getCache,
  getMultipleCache,
  deleteCache,
  invalidateByPattern,
  cacheHealthCheck
};
