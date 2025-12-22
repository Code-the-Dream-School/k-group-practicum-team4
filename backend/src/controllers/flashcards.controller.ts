import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { FlashcardSetModel } from '../models/FlashcardSet';
import { FlashcardModel } from '../models/Flashcard';

const makeStubCards = (count: number) =>
  Array.from({ length: count }).map((_, i) => ({
    front: `Question ${i + 1}`,
    back: `Answer ${i + 1}`,
    explanation: i % 2 === 0 ? 'Stub explanation (replace with AI later).' : undefined,
  }));

export const generateFlashcardsSet = async (req: Request, res: Response) => {
  try {
    const ownerIdStr = req.ownerId;
    if (!ownerIdStr) {
      return res.status(401).json({ message: 'Unauthorized (DEV_USER_ID is missing).' });
    }
    if (!mongoose.Types.ObjectId.isValid(ownerIdStr)) {
      return res.status(400).json({ message: 'Invalid ownerId (ObjectId expected).' });
    }

    const ownerId = new mongoose.Types.ObjectId(ownerIdStr);

    const body = req.body as { resourceId?: string; title?: string; count?: number; text?: string };

    const resourceIdStr = body.resourceId;
    if (!resourceIdStr || !mongoose.Types.ObjectId.isValid(resourceIdStr)) {
      return res.status(400).json({ message: 'resourceId is required (ObjectId).' });
    }
    const resourceId = new mongoose.Types.ObjectId(resourceIdStr);

    const countRaw = typeof body.count === 'number' ? body.count : 10;
    const count = Math.max(1, Math.min(30, Math.floor(countRaw)));

    // Find next sequenceNumber (simple MVP approach)
    const lastSet = await FlashcardSetModel.findOne({ ownerId, resourceId })
      .sort({ sequenceNumber: -1 })
      .select({ sequenceNumber: 1 })
      .lean();

    const nextSeq = (lastSet?.sequenceNumber ?? 0) + 1;

    const title = (body.title && body.title.trim()) || `Flashcards ${nextSeq}`;

    const set = await FlashcardSetModel.create({
      ownerId,
      resourceId,
      sequenceNumber: nextSeq,
      title,
    });

    const cards = makeStubCards(count);

    await FlashcardModel.insertMany(
      cards.map((c) => ({
        ownerId,
        setId: set._id,
        front: c.front,
        back: c.back,
        explanation: c.explanation,
      }))
    );

    return res.status(201).json({
      setId: set._id.toString(),
      title,
      sequenceNumber: nextSeq,
      cardsCount: cards.length,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return res.status(500).json({ message: msg });
  }
};

export const listFlashcardsSetsByResource = async (req: Request, res: Response) => {
  try {
    const ownerIdStr = req.ownerId;
    if (!ownerIdStr) return res.status(401).json({ message: 'Unauthorized (DEV_USER_ID is missing).' });
    if (!mongoose.Types.ObjectId.isValid(ownerIdStr)) return res.status(400).json({ message: 'Invalid ownerId.' });

    const ownerId = new mongoose.Types.ObjectId(ownerIdStr);

    const resourceIdStr = req.params.resourceId;
if (!resourceIdStr || !mongoose.Types.ObjectId.isValid(resourceIdStr)) {
  return res.status(400).json({ message: 'Invalid resourceId.' });
}

    const resourceId = new mongoose.Types.ObjectId(resourceIdStr);

    const sets = await FlashcardSetModel.find({ ownerId, resourceId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(
      sets.map((s) => ({
        id: s._id.toString(),
        title: s.title,
        sequenceNumber: s.sequenceNumber,
        createdAt: s.createdAt,
      }))
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return res.status(500).json({ message: msg });
  }
};

export const getFlashcardsSet = async (req: Request, res: Response) => {
  try {
    const ownerIdStr = req.ownerId;
    if (!ownerIdStr) return res.status(401).json({ message: 'Unauthorized (DEV_USER_ID is missing).' });
    if (!mongoose.Types.ObjectId.isValid(ownerIdStr)) return res.status(400).json({ message: 'Invalid ownerId.' });

    const ownerId = new mongoose.Types.ObjectId(ownerIdStr);

    const setIdStr = req.params.setId;
    if (!setIdStr || !mongoose.Types.ObjectId.isValid(setIdStr)) {
      return res.status(400).json({ message: 'Invalid setId.' });
    }
    

    const setId = new mongoose.Types.ObjectId(setIdStr);

    const set = await FlashcardSetModel.findOne({ _id: setId, ownerId }).lean();
    if (!set) return res.status(404).json({ message: 'Flashcard set not found.' });

    const cards = await FlashcardModel.find({ setId, ownerId }).sort({ createdAt: 1 }).lean();

    return res.json({
      id: set._id.toString(),
      title: set.title,
      sequenceNumber: set.sequenceNumber,
      createdAt: set.createdAt,
      cards: cards.map((c) => ({
        id: c._id.toString(),
        front: c.front,
        back: c.back,
        explanation: c.explanation,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return res.status(500).json({ message: msg });
  }
};

export const deleteFlashcardsSet = async (req: Request, res: Response) => {
  try {
    const ownerIdStr = req.ownerId;
    if (!ownerIdStr) return res.status(401).json({ message: 'Unauthorized (DEV_USER_ID is missing).' });
    if (!mongoose.Types.ObjectId.isValid(ownerIdStr)) return res.status(400).json({ message: 'Invalid ownerId.' });

    const ownerId = new mongoose.Types.ObjectId(ownerIdStr);

    const setIdStr = req.params.setId;
if (!setIdStr || !mongoose.Types.ObjectId.isValid(setIdStr)) {
  return res.status(400).json({ message: 'Invalid setId.' });
}


    const setId = new mongoose.Types.ObjectId(setIdStr);

    const set = await FlashcardSetModel.findOne({ _id: setId, ownerId }).lean();
    if (!set) return res.status(404).json({ message: 'Flashcard set not found.' });

    await FlashcardModel.deleteMany({ setId, ownerId });
    await FlashcardSetModel.deleteOne({ _id: setId, ownerId });

    return res.status(204).send();
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return res.status(500).json({ message: msg });
  }
};
