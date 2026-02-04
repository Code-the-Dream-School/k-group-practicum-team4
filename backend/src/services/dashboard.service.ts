import mongoose from 'mongoose';

export const buildDashboard = async (userId: string) => {
  const stats = await getStats(userId);
  const todayActivity = await getTodayActivity(userId);
  const weeklyActivity = await getWeeklyActivity(userId);

  return {
    stats,
    weeklyActivity,
    todayActivity,
  };
};

interface DashboardStats {
  documentsCount: number;
  flashcardsCount: number;
  quizzesCount: number;
}

interface TodayActivity {
  quizzesCompleted: number;
}

interface WeeklyActivity {
  flashcards: number;
  summaries: number;
  quizzes: number;
}

const getStats = async (userId: string): Promise<DashboardStats> => {
  const uid = new mongoose.Types.ObjectId(userId);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const resourcesCount = await db
    .collection('resources')
    .countDocuments({ ownerId: uid });
  const flashcardsCount = await db
    .collection('flashcards')
    .countDocuments({ ownerId: uid });
  const quizzesCount = await db
    .collection('quizzes')
    .countDocuments({ ownerId: uid });

  return {
    documentsCount: resourcesCount,
    flashcardsCount: flashcardsCount,
    quizzesCount: quizzesCount,
  };
};

const getTodayActivity = async (userId: string): Promise<TodayActivity> => {
  const uid = new mongoose.Types.ObjectId(userId);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );

  const quizzesCompleted = await db.collection('quizattempts').countDocuments({
    ownerId: uid,
    finishedAt: { $gte: today, $lt: tomorrow },
  });

  return { quizzesCompleted };
};

const getWeeklyActivity = async (userId: string): Promise<WeeklyActivity> => {
  const uid = new mongoose.Types.ObjectId(userId);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const now = new Date();
  const fromDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7),
  );

  const [flashcardsCount, summariesCount, quizzesCount] = await Promise.all([
    db.collection('flashcards').countDocuments({
      ownerId: uid,
      createdAt: { $gte: fromDate },
    }),
    db.collection('resources').countDocuments({
      ownerId: uid,
      createdAt: { $gte: fromDate },
      summary: { $exists: true, $ne: null },
    }),
    db.collection('quizzes').countDocuments({
      ownerId: uid,
      createdAt: { $gte: fromDate },
    }),
  ]);

  const total = flashcardsCount + summariesCount + quizzesCount;

  if (total === 0) {
    return {
      flashcards: 0,
      summaries: 0,
      quizzes: 0,
    };
  }

  return {
    flashcards: Math.round((flashcardsCount / total) * 100),
    summaries: Math.round((summariesCount / total) * 100),
    quizzes: Math.round((quizzesCount / total) * 100),
  };
};
