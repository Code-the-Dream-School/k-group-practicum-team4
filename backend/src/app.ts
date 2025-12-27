import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import flashcardsRoutes from './routes/flashcards.routes';


// import helloRoutes from './routes/hello.routes';

const app: Application = express();

// Security & best-practice middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Dev-only user identity placeholder (until auth/JWT is implemented).
// With exactOptionalPropertyTypes enabled, we should only assign when the value exists.
app.use((req, _res, next) => {
  const devUserId = process.env.DEV_USER_ID;
  if (devUserId) req.ownerId = devUserId;
  next();
});

app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
// app.use('/api/hello', helloRoutes);
app.use('/api', flashcardsRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

export default app;
