import { Request, Response, NextFunction } from "express";
import { MOCK_USER } from "../config/constants";

// Mock authentication middleware until real auth is ready
export const mockAuth = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  req.user = {
    id: MOCK_USER.ID,
    email: MOCK_USER.EMAIL,
  };
  next();
};
