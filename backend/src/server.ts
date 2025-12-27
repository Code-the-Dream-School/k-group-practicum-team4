import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectMongo from './config/db.mongo';

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI as string;

const startServer = async () => {
  await connectMongo(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
