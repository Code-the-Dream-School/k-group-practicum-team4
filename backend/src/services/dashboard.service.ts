import mongoose from 'mongoose';
import { Resource } from '../models/Resource.js';
import { FlashcardSetModel } from '../models/FlashcardSet.js';
import { Quiz } from '../models/Quiz.js';

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

export type ActivityLogItem = {
  id: string;
  type: "resource_uploaded" | "summary_created" | "flashcards_created" | "quiz_created";
  resourceId: string;
  resourceTitle: string;
  createdAt: string;
};

type ActivityLogOptions = {
  limit?: number;
};

type ResourceSummaryDoc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  summary?: {
    createdAt?: Date;
  };
};

interface DashboardStats {
  documentsCount: number;
  flashcardsCount: number;
  quizzesCount: number;
}

interface TodayActivity {
  studiedMinutes: number;
  flashcardsReviewed: number;
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
    .collection('flashcard_sets')
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

  const [quizzesCompleted, flashcardsReviewed, minutesAgg] = await Promise.all([
    db.collection('quizattempts').countDocuments({
      ownerId: uid,
      finishedAt: { $gte: today, $lt: tomorrow },
    }),
    db.collection('flashcards').countDocuments({
      ownerId: uid,
      createdAt: { $gte: today, $lt: tomorrow },
    }),
    db.collection('quizattempts').aggregate([
      {
        $match: {
          ownerId: uid,
          finishedAt: { $gte: today, $lt: tomorrow },
          startedAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalMs: {
            $sum: { $subtract: ['$finishedAt', '$startedAt'] },
          },
        },
      },
    ]).toArray(),
  ]);

  const totalMs =
    minutesAgg.length > 0 && typeof minutesAgg[0]?.totalMs === 'number'
      ? minutesAgg[0].totalMs
      : 0;
  const studiedMinutes = Math.max(0, Math.round(totalMs / 60000));

  return { studiedMinutes, flashcardsReviewed, quizzesCompleted };
};

/*
  Legacy block kept for reference:
  const quizzesCompleted = await db.collection('quizattempts').countDocuments({
    ownerId: uid,
    finishedAt: { $gte: today, $lt: tomorrow },
  });
*/

const getWeeklyActivity = async (userId: string): Promise<WeeklyActivity> => {
  const uid = new mongoose.Types.ObjectId(userId);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const now = new Date();
  const fromDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30),
  );

  const [flashcardSetsCount, summariesCount, quizzesCount] = await Promise.all([
    db.collection('flashcard_sets').countDocuments({
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

  const total = flashcardSetsCount + summariesCount + quizzesCount;

  if (total === 0) {
    return {
      flashcards: 0,
      summaries: 0,
      quizzes: 0,
    };
  }

  return {
    flashcards: Math.round((flashcardSetsCount / total) * 100),
    summaries: Math.round((summariesCount / total) * 100),
    quizzes: Math.round((quizzesCount / total) * 100),
  };
};

const toIsoString = (value?: Date): string => {
  if (!value) return new Date().toISOString();
  return value.toISOString();
};

export const buildActivityLog = async (
  userId: string,
  options: ActivityLogOptions = {}
): Promise<ActivityLogItem[]> => {
  const limit = Math.max(1, Math.min(50, options.limit ?? 10));
  const uid = new mongoose.Types.ObjectId(userId);

  const [resources, summaries, flashcardSets, quizzes] = await Promise.all([
    Resource.find({ ownerId: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select({ _id: 1, title: 1, createdAt: 1 })
      .lean(),
    Resource.find({ ownerId: uid, "summary.createdAt": { $exists: true } })
      .sort({ "summary.createdAt": -1 })
      .limit(limit)
      .select({ _id: 1, title: 1, summary: 1 })
      .lean(),
    FlashcardSetModel.find({ ownerId: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select({ _id: 1, resourceId: 1, createdAt: 1 })
      .lean(),
    Quiz.find({ ownerId: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select({ _id: 1, resourceId: 1, createdAt: 1 })
      .lean(),
  ]);

  const resourceIds = new Set<string>();
  flashcardSets.forEach((set) => resourceIds.add(set.resourceId.toString()));
  quizzes.forEach((quiz) => resourceIds.add(quiz.resourceId.toString()));

  const resourceTitles = new Map<string, string>();
  if (resourceIds.size > 0) {
    const resourceDocs = await Resource.find({
      _id: { $in: Array.from(resourceIds) },
    })
      .select({ _id: 1, title: 1 })
      .lean();
    resourceDocs.forEach((doc) => {
      resourceTitles.set(doc._id.toString(), doc.title);
    });
  }

  const items: ActivityLogItem[] = [
    ...resources.map((resource) => ({
      id: resource._id.toString(),
      type: "resource_uploaded" as const,
      resourceId: resource._id.toString(),
      resourceTitle: resource.title,
      createdAt: toIsoString(resource.createdAt),
    })),
    ...summaries.map((resource: ResourceSummaryDoc) => ({
      id: `${resource._id.toString()}-summary`,
      type: "summary_created" as const,
      resourceId: resource._id.toString(),
      resourceTitle: resource.title,
      createdAt: toIsoString(resource.summary?.createdAt),
    })),
    ...flashcardSets.map((set) => ({
      id: set._id.toString(),
      type: "flashcards_created" as const,
      resourceId: set.resourceId.toString(),
      resourceTitle:
        resourceTitles.get(set.resourceId.toString()) || "Untitled Resource",
      createdAt: toIsoString(set.createdAt),
    })),
    ...quizzes.map((quiz) => ({
      id: quiz._id.toString(),
      type: "quiz_created" as const,
      resourceId: quiz.resourceId.toString(),
      resourceTitle:
        resourceTitles.get(quiz.resourceId.toString()) || "Untitled Resource",
      createdAt: toIsoString(quiz.createdAt),
    })),
  ];

  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
};
