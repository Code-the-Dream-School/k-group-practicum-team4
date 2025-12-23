import express from "express";
import type { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import resourceRoutes from "./routes/resourceRoutes";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";

const app: Application = express();

// Security & best-practice middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Root route
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

// Routes
app.use("/api/resources", resourceRoutes);

// Error handling (ALWAYS LAST!)
app.use("*", notFoundHandler);
app.use(globalErrorHandler);

export default app;
