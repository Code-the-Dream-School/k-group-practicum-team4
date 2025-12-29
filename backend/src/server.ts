import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectMongo from "./config/db.mongo";
import { validateEnv } from "./config/constants";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnv();

    await connectMongo(process.env.MONGO_URI!);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
