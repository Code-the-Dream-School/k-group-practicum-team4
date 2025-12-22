import mongoose, { Schema } from 'mongoose';

export type FlashcardSet = {
  ownerId: mongoose.Types.ObjectId;
  resourceId: mongoose.Types.ObjectId;
  sequenceNumber: number;
  title: string;
  createdAt?: Date;
};

const FlashcardSetSchema = new Schema<FlashcardSet>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
    resourceId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'Resource' },
    sequenceNumber: { type: Number, required: true },
    title: { type: String, required: true },
  },
  {
    collection: 'flashcard_sets',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const FlashcardSetModel: mongoose.Model<FlashcardSet> =
  mongoose.models.FlashcardSet
    ? (mongoose.models.FlashcardSet as mongoose.Model<FlashcardSet>)
    : mongoose.model<FlashcardSet>('FlashcardSet', FlashcardSetSchema);
