import Redis from 'ioredis';

let redis: Redis;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    lazyConnect: true,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redis.on('error', (error) => {
    console.log('⚠️ Redis not available, caching disabled');
  });
} catch (error) {
  console.log('⚠️ Redis not available, caching disabled');
}

export default redis!;