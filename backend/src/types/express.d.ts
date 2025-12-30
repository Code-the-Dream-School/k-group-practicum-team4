import "express";

declare global {
  namespace Express {
    interface Request {
      ownerId?: string;

      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

export {};
