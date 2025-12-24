import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import resourceRoutes from "./routes/resourceRoutes";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";

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

app.use("/api/resources", resourceRoutes);

app.use("*", notFoundHandler);
app.use(globalErrorHandler);

export default app;
