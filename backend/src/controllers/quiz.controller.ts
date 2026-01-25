import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Quiz } from "../models/Quiz";
import { QuizQuestion } from "../models/QuizQuestion";
import { QuizAttempt, IQuizAnswer } from "../models/QuizAttempt";
import { Resource } from "../models/Resource";
import { generateQuizFromText, QUIZ_LIMITS } from "../services/quizGenerator";

const requireUserObjectId = (
  req: Request,
  res: Response
): mongoose.Types.ObjectId | null => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: "User not authenticated",
    });
    return null;
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({
      success: false,
      error: "Invalid user ID",
    });
    return null;
  }
  return new mongoose.Types.ObjectId(userId);
};

// 1. POST /api/quiz-sets/generate
export const generateQuizSet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();

  try {
    const ownerId = requireUserObjectId(req, res);
    if (!ownerId) return;

    const { resourceId, title, questionCount = 10 } = req.body;

    if (!resourceId || !mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({
        success: false,
        error: "Valid resourceId is required",
      });
    }

    if (
      questionCount < QUIZ_LIMITS.MIN_QUESTION_COUNT ||
      questionCount > QUIZ_LIMITS.MAX_QUESTION_COUNT
    ) {
      return res.status(400).json({
        success: false,
        error: `Question count must be between ${QUIZ_LIMITS.MIN_QUESTION_COUNT} and ${QUIZ_LIMITS.MAX_QUESTION_COUNT}`,
      });
    }

    const resource = await Resource.findOne({ _id: resourceId, ownerId });
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: "Resource not found",
      });
    }

    const textContent = resource.textContent || "";
    const minRequired = questionCount * QUIZ_LIMITS.MIN_CHARS_PER_QUESTION;

    if (textContent.length < minRequired) {
      return res.status(400).json({
        success: false,
        error: `Text too short for ${questionCount} questions. Need at least ${minRequired} characters, got ${textContent.length}`,
      });
    }

    if (textContent.length > QUIZ_LIMITS.MAX_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Text is too long (maximum ${QUIZ_LIMITS.MAX_TEXT_LENGTH} characters)`,
      });
    }

    let generatedQuiz;
    try {
      generatedQuiz = await generateQuizFromText(textContent, questionCount);
    } catch (aiError: any) {
      console.error("[quiz] AI generation failed:", aiError);

      if (aiError.message.includes("GEMINI_API_KEY")) {
        return res.status(500).json({
          success: false,
          error:
            "Quiz generation service is not configured. Please contact support.",
        });
      }

      return res.status(503).json({
        success: false,
        error: aiError.message || "Failed to generate quiz. Please try again.",
      });
    }

    session.startTransaction();

    try {
      const maxSeq = await Quiz.findOne({ resourceId })
        .sort({ sequenceNumber: -1 })
        .select("sequenceNumber")
        .session(session);

      const sequenceNumber = (maxSeq?.sequenceNumber || 0) + 1;
      const quizTitle =
        title?.trim() || `${resource.title} - Quiz #${sequenceNumber}`;

      const createdQuizzes = await Quiz.create(
        [
          {
            ownerId,
            resourceId,
            sequenceNumber,
            title: quizTitle,
            questionCount: generatedQuiz.questions.length,
          },
        ],
        { session }
      );

      const quiz = createdQuizzes[0];
      if (!quiz) {
        throw new Error("Failed to create quiz");
      }

      const questionsData = generatedQuiz.questions.map((q, idx) => ({
        quizId: quiz._id,
        ownerId,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        order: idx,
      }));

      const insertedQuestions = await QuizQuestion.insertMany(questionsData, {
        session,
      });

      await session.commitTransaction();

      const questionsForClient = insertedQuestions.map((q) => ({
        id: q._id,
        prompt: q.prompt,
        options: q.options,
        order: q.order,
      }));

      return res.status(201).json({
        success: true,
        quizId: quiz._id,
        title: quiz.title,
        questionCount: quiz.questionCount,
        questions: questionsForClient,
      });
    } catch (dbError) {
      await session.abortTransaction();
      console.error("[quiz] Database transaction failed:", dbError);
      throw dbError;
    }
  } catch (error: any) {
    console.error("[quiz] generateQuizSet error:", error);
    next(error);
  } finally {
    session.endSession();
  }
};

// 2. GET /api/quiz-sets
export const listAllQuizSets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = requireUserObjectId(req, res);
    if (!ownerId) return;

    const quizzes = await Quiz.find({ ownerId })
      .sort({ createdAt: -1 })
      .populate("resourceId", "title")
      .lean();

    // Get last attempt for each quiz
    const quizIds = quizzes.map((q) => q._id);
    const lastAttempts = await QuizAttempt.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(ownerId),
          quizId: { $in: quizIds },
        },
      },
      { $sort: { finishedAt: -1 } },
      { $group: { _id: "$quizId", lastScore: { $first: "$scorePercent" } } },
    ]);

    const lastScoreMap = new Map(
      lastAttempts.map((a) => [a._id.toString(), a.lastScore])
    );

    const result = quizzes.map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      resourceId: quiz.resourceId._id,
      resourceTitle: (quiz.resourceId as any).title,
      questionCount: quiz.questionCount,
      lastScore: lastScoreMap.get(quiz._id.toString()) || null,
      createdAt: quiz.createdAt,
    }));

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[quiz] listAllQuizSets error:", error);
    next(error);
  }
};

// 3. GET /api/resources/:resourceId/quiz-sets
export const listQuizSetsByResource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = requireUserObjectId(req, res);
    if (!ownerId) return;

    const { resourceId } = req.params;

    if (!resourceId || !mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ error: "Invalid resourceId" });
    }

    const quizzes = await Quiz.find({ resourceId, ownerId })
      .sort({ createdAt: -1 })
      .lean();

    // Get last attempt for each quiz
    const quizIds = quizzes.map((q) => q._id);
    const lastAttempts = await QuizAttempt.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(ownerId),
          quizId: { $in: quizIds },
        },
      },
      { $sort: { finishedAt: -1 } },
      { $group: { _id: "$quizId", lastScore: { $first: "$scorePercent" } } },
    ]);

    const lastScoreMap = new Map(
      lastAttempts.map((a) => [a._id.toString(), a.lastScore])
    );

    const result = quizzes.map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      questionCount: quiz.questionCount,
      lastScore: lastScoreMap.get(quiz._id.toString()) || null,
      createdAt: quiz.createdAt,
    }));

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[quiz] listQuizSetsByResource error:", error);
    next(error);
  }
};

// 4. GET /api/quiz-sets/:quizId/questions
export const getQuizQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = requireUserObjectId(req, res);
    if (!ownerId) return;

    const { quizId } = req.params;

    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quizId" });
    }

    // Check quiz exists and belongs to user
    const quiz = await Quiz.findOne({ _id: quizId, ownerId }).lean();
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Get questions WITHOUT correctIndex (for taking quiz)
    const questions = await QuizQuestion.find({ quizId })
      .sort({ order: 1 })
      .select("_id prompt options order")
      .lean();

    return res.status(200).json({
      id: quiz._id,
      title: quiz.title,
      questionCount: quiz.questionCount,
      questions: questions.map((q) => ({
        id: q._id,
        prompt: q.prompt,
        options: q.options,
        order: q.order,
      })),
    });
  } catch (error: any) {
    console.error("[quiz] getQuizQuestions error:", error);
    next(error);
  }
};

// 5. POST /api/quiz-sets/:quizId/submit
export const submitQuizAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = requireUserObjectId(req, res);
    if (!ownerId) return;

    const { quizId } = req.params;
    const { answers, startedAt } = req.body;

    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quizId" });
    }

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quizId" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Answers array is required" });
    }

    if (!startedAt) {
      return res.status(400).json({ error: "startedAt timestamp is required" });
    }

    // Load quiz + questions in parallel
    const [quiz, questions] = await Promise.all([
      Quiz.findOne({ _id: quizId, ownerId }).lean(),
      QuizQuestion.find({ quizId }).sort({ order: 1 }).lean(),
    ]);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Validate answers count
    if (answers.length !== questions.length) {
      return res.status(400).json({
        error: `Expected ${questions.length} answers, got ${answers.length}`,
      });
    }

    // Validate all questionIds exist
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
    const invalidIds = answers.filter((a) => !questionMap.has(a.questionId));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        error: "Invalid question IDs",
        invalidIds: invalidIds.map((a) => a.questionId),
      });
    }

    // Validate selectedIndex ranges
    const invalidIndexes = answers.filter(
      (a) => a.selectedIndex < 0 || a.selectedIndex > 3
    );
    if (invalidIndexes.length > 0) {
      return res.status(400).json({
        error: "Invalid answer indexes (must be 0-3)",
      });
    }

    // Check answers and build results
    const results = answers.map((ans) => {
      const question = questionMap.get(ans.questionId)!;
      const isCorrect = ans.selectedIndex === question.correctIndex;

      return {
        questionId: question._id,
        prompt: question.prompt,
        options: question.options,
        selectedIndex: ans.selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect,
        explanation: question.explanation,
      };
    });

    // Calculate score
    const correctCount = results.filter((r) => r.isCorrect).length;
    const scorePercent = Math.round((correctCount / results.length) * 100);

    const finishedAt = new Date();
    const startedAtDate = new Date(startedAt);

    // Save attempt
    const answersToSave: IQuizAnswer[] = results.map((r) => ({
      questionId: r.questionId,
      selectedIndex: r.selectedIndex,
      isCorrect: r.isCorrect,
      correctIndex: r.correctIndex,
    }));

    const attempt = await QuizAttempt.create({
      ownerId,
      quizId,
      scorePercent,
      correctCount,
      totalQuestions: questions.length,
      answers: answersToSave,
      startedAt: startedAtDate,
      finishedAt,
    });

    // Return results
    return res.status(200).json({
      attemptId: attempt._id,
      scorePercent,
      correctCount,
      totalQuestions: questions.length,
      results,
    });
  } catch (error: any) {
    console.error("[quiz] submitQuizAttempt error:", error);
    next(error);
  }
};

// 6. GET /api/quiz-attempts/:attemptId
export const getAttemptResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = requireUserObjectId(req, res);
    if (!ownerId) return;

    const { attemptId } = req.params;

    if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ error: "Invalid attemptId" });
    }

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      ownerId,
    }).lean();
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    // Get question details for display
    const questionIds = attempt.answers.map((a) => a.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: questionIds } })
      .select("_id prompt options explanation")
      .lean();

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const results = attempt.answers.map((ans) => {
      const question = questionMap.get(ans.questionId.toString())!;
      return {
        questionId: ans.questionId,
        prompt: question.prompt,
        options: question.options,
        selectedIndex: ans.selectedIndex,
        correctIndex: ans.correctIndex,
        isCorrect: ans.isCorrect,
        explanation: question.explanation,
      };
    });

    return res.status(200).json({
      attemptId: attempt._id,
      scorePercent: attempt.scorePercent,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      finishedAt: attempt.finishedAt,
      results,
    });
  } catch (error: any) {
    console.error("[quiz] getAttemptResults error:", error);
    next(error);
  }
};

// 7. DELETE /api/quiz-sets/:quizId
export const deleteQuizSet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = requireUserObjectId(req, res);
    if (!ownerId) return;

    const { quizId } = req.params;

    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quizId" });
    }

    // Check quiz exists and belongs to user
    const quiz = await Quiz.findOne({ _id: quizId, ownerId });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Delete in transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete quiz, questions, and attempts
      await Promise.all([
        Quiz.deleteOne({ _id: quizId }, { session }),
        QuizQuestion.deleteMany({ quizId }, { session }),
        QuizAttempt.deleteMany({ quizId }, { session }),
      ]);

      await session.commitTransaction();

      return res
        .status(200)
        .json({ success: true, message: "Quiz deleted successfully" });
    } catch (dbError) {
      await session.abortTransaction();
      throw dbError;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error("[quiz] deleteQuizSet error:", error);
    next(error);
  }
};
