import express from "express";
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

router.post("/quiz-sets/generate", generateQuizSet);
router.get("/quiz-sets", listAllQuizSets);
router.get("/quiz-sets/:quizId/questions", getQuizQuestions);
router.post("/quiz-sets/:quizId/submit", submitQuizAttempt);
router.delete("/quiz-sets/:quizId", deleteQuizSet);

router.get("/resources/:resourceId/quiz-sets", listQuizSetsByResource);

router.get("/quiz-attempts/:attemptId", getAttemptResults);

export default router;
