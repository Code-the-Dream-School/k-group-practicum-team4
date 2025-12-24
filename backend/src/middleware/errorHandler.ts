import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
};

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Always log on server
  console.error("Unhandled error:", err);

  // Mongoose validation errors
  if (err?.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details,
    });
  }

  // Invalid ObjectId format
  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  const status = typeof err?.status === "number" ? err.status : 500;

  const payload: any = {
    success: false,
    error:
      status >= 500
        ? "Internal server error"
        : err?.message || "Request failed",
  };

  if (process.env.NODE_ENV === "development") {
    payload.details = err?.message;
    payload.stack = err?.stack;
  }

  return res.status(status).json(payload);
};
