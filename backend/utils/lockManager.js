const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Distributed Lock Manager using Redis SETNX
 * Prevents race conditions and double-booking
 */
const lockManager = {
  /**
   * Acquire a lock for a specific asset (e.g., a seat)
   * @param {string} resourceId - Unique ID for the resource (e.g., flight:101:seat:12A)
   * @param {string} userId - ID of the user requesting the lock
   * @param {number} ttl - Time-to-live in seconds (default 600s / 10m)
   * @returns {Promise<boolean>} - True if lock acquired, false otherwise
   */
  acquireLock: async (resourceId, userId, ttl = 600) => {
    const key = `lock:${resourceId}`;
    // NX: Set if Not Exists, EX: Expire in seconds
    const result = await redis.set(key, userId, 'NX', 'EX', ttl);
    return result === 'OK';
  },

  /**
   * Verify if the lock is still held by the specific user
   * @param {string} resourceId 
   * @param {string} userId 
   * @returns {Promise<boolean>}
   */
  verifyLock: async (resourceId, userId) => {
    const key = `lock:${resourceId}`;
    const currentOwner = await redis.get(key);
    return currentOwner === userId;
  },

  /**
   * Explicitly release a lock
   * @param {string} resourceId 
   * @param {string} userId 
   */
  releaseLock: async (resourceId, userId) => {
    const key = `lock:${resourceId}`;
    // Use a Lua script to ensure atomic check-and-delete (only owner can delete)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    return await redis.eval(script, 1, key, userId);
  }
};

module.exports = { lockManager, redis };
