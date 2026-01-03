import Redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

const connectRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = Redis.createClient({
        url: process.env.REDIS_URL,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('❌ Redis server refused connection');
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.error('❌ Redis retry time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            console.error('❌ Redis max retry attempts reached');
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis Connected');
      });

      redisClient.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      redisClient.on('ready', () => {
        console.log('🚀 Redis Ready');
      });

      redisClient.on('end', () => {
        console.log('🔚 Redis Connection Ended');
      });

      await redisClient.connect();
    } else {
      console.log('⚠️ Redis URL not provided, skipping Redis connection');
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    // Don't exit process for Redis connection failure
  }
};

const getRedisClient = () => {
  return redisClient;
};

const setCache = async (key, value, expireTime = 3600) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.setEx(key, expireTime, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

const getCache = async (key) => {
  if (!redisClient) return null;
  
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

const clearCache = async () => {
  if (!redisClient) return false;
  
  try {
    await redisClient.flushAll();
    return true;
  } catch (error) {
    console.error('Redis clear error:', error);
    return false;
  }
};

export { 
  connectRedis, 
  getRedisClient, 
  setCache, 
  getCache, 
  deleteCache, 
  clearCache 
};
