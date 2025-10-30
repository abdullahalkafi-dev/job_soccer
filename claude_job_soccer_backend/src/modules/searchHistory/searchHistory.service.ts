import redisClient from "../../shared/redis/redisClient";

/**
 * Service to manage top search terms for different entity types
 * Uses Redis sorted sets to maintain search term frequencies
 */

export enum SearchEntityType {
  JOB = 'job',
  CANDIDATE = 'candidate',
  EMPLOYER = 'employer'
}

const MAX_RESULTS = 5;

/**
 * Get the Redis key for a specific entity type
 */
const getKey = (entityType: SearchEntityType): string => {
  return `search:history:${entityType}`;
};

/**
 * Record a search term
 * Increments the score (count) of the search term in the sorted set
 */
const recordSearch = async (entityType: SearchEntityType, searchTerm: string): Promise<void> => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return;
    }

    const normalizedTerm = searchTerm.trim().toLowerCase();
    const key = getKey(entityType);
    
    await redisClient.ensureConnected();
    
    // Increment the score of the search term
    await redisClient.client.zincrby(key, 1, normalizedTerm);
    
    // Set expiry to 30 days (optional - keeps data fresh)
    await redisClient.client.expire(key, 30 * 24 * 60 * 60);
  } catch (error) {
    console.error(`Error recording search for ${entityType}:`, error);
    // Don't throw - search history is non-critical
  }
};

/**
 * Get top N search terms for an entity type
 * Returns terms ordered by frequency (most searched first)
 */
const getTopSearches = async (entityType: SearchEntityType, limit: number = MAX_RESULTS): Promise<string[]> => {
  try {
    const key = getKey(entityType);
    
    await redisClient.ensureConnected();
    
    // Get top terms with scores in descending order
    const results = await redisClient.client.zrevrange(key, 0, limit - 1);
    
    return results;
  } catch (error) {
    console.error(`Error getting top searches for ${entityType}:`, error);
    return [];
  }
};

/**
 * Get top 5 searches for all entity types
 * Returns an object with job, candidate, and employer search terms
 */
const getAllTopSearches = async (): Promise<{
  jobs: string[];
  candidates: string[];
  employers: string[];
}> => {
  try {
    const [jobs, candidates, employers] = await Promise.all([
      getTopSearches(SearchEntityType.JOB),
      getTopSearches(SearchEntityType.CANDIDATE),
      getTopSearches(SearchEntityType.EMPLOYER)
    ]);

    return {
      jobs,
      candidates,
      employers
    };
  } catch (error) {
    console.error('Error getting all top searches:', error);
    return {
      jobs: [],
      candidates: [],
      employers: []
    };
  }
};

/**
 * Get top searches with their counts
 */
const getTopSearchesWithCounts = async (entityType: SearchEntityType, limit: number = MAX_RESULTS): Promise<Array<{ term: string; count: number }>> => {
  try {
    const key = getKey(entityType);
    
    await redisClient.ensureConnected();
    
    // Get top terms with scores
    const results = await redisClient.client.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    
    // Parse results into term-count pairs
    const searchTerms: Array<{ term: string; count: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      searchTerms.push({
        term: results[i],
        count: parseInt(results[i + 1], 10)
      });
    }
    
    return searchTerms;
  } catch (error) {
    console.error(`Error getting top searches with counts for ${entityType}:`, error);
    return [];
  }
};

/**
 * Clear search history for a specific entity type
 */
const clearSearchHistory = async (entityType: SearchEntityType): Promise<void> => {
  try {
    const key = getKey(entityType);
    await redisClient.del(key);
  } catch (error) {
    console.error(`Error clearing search history for ${entityType}:`, error);
    throw error;
  }
};

/**
 * Clear all search histories
 */
const clearAllSearchHistories = async (): Promise<void> => {
  try {
    await Promise.all([
      clearSearchHistory(SearchEntityType.JOB),
      clearSearchHistory(SearchEntityType.CANDIDATE),
      clearSearchHistory(SearchEntityType.EMPLOYER)
    ]);
  } catch (error) {
    console.error('Error clearing all search histories:', error);
    throw error;
  }
};

export const SearchHistoryService = {
  recordSearch,
  getTopSearches,
  getAllTopSearches,
  getTopSearchesWithCounts,
  clearSearchHistory,
  clearAllSearchHistories,
};
