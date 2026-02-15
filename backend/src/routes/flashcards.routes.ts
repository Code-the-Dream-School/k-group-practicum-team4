import express from 'express';
import {
  generateFlashcardsSet,
  listAllFlashcardSets,
  listFlashcardsSetsByResource,
  getFlashcardsSet,
  deleteFlashcardsSet,
  recordFlashcardStudySession,
} from '../controllers/flashcards.controller';

const router = express.Router();

router.post('/flashcard-sets/generate', generateFlashcardsSet);
router.get('/flashcard-sets', listAllFlashcardSets);
router.get('/resources/:resourceId/flashcard-sets', listFlashcardsSetsByResource);
router.get('/flashcard-sets/:setId', getFlashcardsSet);
router.delete('/flashcard-sets/:setId', deleteFlashcardsSet);
router.post('/flashcard-sets/:setId/sessions', recordFlashcardStudySession);

export default router;
