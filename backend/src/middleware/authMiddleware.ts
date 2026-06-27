import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided. Access denied.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).user?.role;
    if (!roles.includes(userRole)) {
      res.status(403).json({
        message: `Access denied. Your role '${userRole}' is not authorized.`,
      });
      return;
    }
    next();
  };
};