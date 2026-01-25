import express from "express";
import rateLimit from "express-rate-limit";
import {
  generateQuizSet,
  listAllQuizSets,
  listQuizSetsByResource,
  getQuizQuestions,
  submitQuizAttempt,
  getAttemptResults,
  deleteQuizSet,
} from "../controllers/quiz.controller";

const router = express.Router();

const quizGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    error:
      "You've reached the quiz generation limit. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/quiz-sets/generate", quizGenerationLimiter, generateQuizSet);
router.get("/quiz-sets", listAllQuizSets);
router.get("/quiz-sets/:quizId/questions", getQuizQuestions);
router.post("/quiz-sets/:quizId/submit", submitQuizAttempt);
router.delete("/quiz-sets/:quizId", deleteQuizSet);

router.get("/resources/:resourceId/quiz-sets", listQuizSetsByResource);

router.get("/quiz-attempts/:attemptId", getAttemptResults);

export default router;
