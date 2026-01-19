// backend/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth";
import resourceRoutes from "./routes/resourceRoutes";
import flashcardsRoutes from "./routes/flashcards.routes";
import aiRoutes from "./routes/ai.routes";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";
import { auth as authMiddleware  } from "./middleware/auth";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      error: "Too many requests, please try again later.",
    },
  });

  app.use(limiter);
}

app.get("/health", (_req, res) => {
  res.send("Backend API is running");
});

app.use("/api/auth", authRouter);
app.use("/api/resources", authMiddleware, resourceRoutes);
app.use("/api", authMiddleware, flashcardsRoutes);

app.use("*", notFoundHandler);
app.use(globalErrorHandler);

export default app;
