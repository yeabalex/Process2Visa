import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface JwtPayload {
  valid: any;
  chatId: string;
}

export function createToken(chatId: string): string {
  return jwt.sign({ chatId }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
