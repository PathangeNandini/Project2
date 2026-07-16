import { Request, Response, NextFunction } from 'express';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).user?.role;

    if (!userRole) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        message: `Access denied. Role '${userRole}' is not permitted for this action.`,
      });
      return;
    }

    next();
  };
};