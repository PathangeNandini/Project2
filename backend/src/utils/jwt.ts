import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: string;
  storeId?: string;
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn: expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as TokenPayload;
}