import { Request, Response, NextFunction } from 'express';

let redis: any;
try {
  redis = require('../config/redis').default;
} catch {
  redis = null;
}

export const cacheResponse = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!redis) {
      next();
      return;
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        res.status(200).json(JSON.parse(cached));
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        redis.setex(key, duration, JSON.stringify(body));
        return originalJson(body);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

export const clearCache = async (pattern: string): Promise<void> => {
  if (!redis) return;
  try {
    const keys = await redis.keys(`cache:${pattern}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.log('Cache clear failed:', error);
  }
};