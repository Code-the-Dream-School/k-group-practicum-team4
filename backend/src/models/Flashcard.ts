import mongoose, { Schema } from 'mongoose';

export type Flashcard = {
  ownerId: mongoose.Types.ObjectId;
  setId: mongoose.Types.ObjectId;
  front: string;
  back: string;
  explanation?: string;
  createdAt?: Date;
};

const FlashcardSchema = new Schema<Flashcard>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
    setId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'FlashcardSet' },
    front: { type: String, required: true },
    back: { type: String, required: true },
    explanation: { type: String },
  },
  {
    collection: 'flashcards',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const FlashcardModel: mongoose.Model<Flashcard> =
  mongoose.models.Flashcard
    ? (mongoose.models.Flashcard as mongoose.Model<Flashcard>)
    : mongoose.model<Flashcard>('Flashcard', FlashcardSchema);
