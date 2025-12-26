import dotenv from "dotenv";
import app from "./app";
import connectMongo from "./config/db.mongo";
import { validateEnv } from "./config/constants";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnv();

    await connectMongo(process.env.MONGODB_URI!);

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
