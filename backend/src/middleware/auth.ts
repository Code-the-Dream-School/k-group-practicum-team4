import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors';
import { MOCK_USER } from '../config/constants';

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthenticatedError('Authentication invalid'));
  }

  const parts = authHeader.split(' ');

  if (parts.length < 2 || !parts[1]) {
    return next(new UnauthenticatedError('Authentication token missing'));
  }

  const token = parts[1];

  if (!process.env.JWT_SECRET) {
    return next(new Error('JWT_SECRET is not defined'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    req.user = {
      id: payload.userId as string,
      email: payload.email as string,
      displayName: payload.displayName as string,
      avatarId: payload.avatarId as string,
    };

    next();
  } catch (err) {
    return next(new UnauthenticatedError('Authentication invalid'));
  }
};

// Mock authentication middleware until real auth is ready
export const mockAuth = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  req.user = {
    id: MOCK_USER.ID,
    email: MOCK_USER.EMAIL,
    displayName: 'Mock User',
    avatarId: '',
  };
  next();
};
