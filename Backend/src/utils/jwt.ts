import jwt from 'jsonwebtoken';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'dev_secret';

export function signToken(payload: object, expiresIn = 300000) {
  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
} 