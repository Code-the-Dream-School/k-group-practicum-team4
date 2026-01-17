import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from '../models/User';
import { BadRequestError, UnauthenticatedError } from '../errors';

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.create({ ...req.body });

    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({
      user: { displayName: user.displayName },
      token,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return next(new BadRequestError(`Duplicate value entered for ${Object.keys(
        error.keyValue
      )} field, please choose another value`));
    }

    return next(error);
  }
};

// Login existing user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return next(new BadRequestError('Please provide email and password'));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new UnauthenticatedError('Invalid Credentials'));
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new UnauthenticatedError('Invalid Credentials'));
  }

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    user: { displayName: user.displayName },
    token,
  });
};
