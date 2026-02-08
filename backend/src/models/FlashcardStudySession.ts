import mongoose, { Schema } from "mongoose";

export type FlashcardStudySession = {
  ownerId: mongoose.Types.ObjectId;
  setId: mongoose.Types.ObjectId;
  cardsReviewed: number;
  startedAt: Date;
  finishedAt: Date;
  createdAt: Date;
};

const FlashcardStudySessionSchema = new Schema<FlashcardStudySession>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    setId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "FlashcardSet" },
    cardsReviewed: { type: Number, required: true, min: 0 },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, required: true },
  },
  {
    collection: "flashcard_study_sessions",
    timestamps: { createdAt: true, updatedAt: false },
  }
);

FlashcardStudySessionSchema.pre("validate", function (next) {
  if (this.startedAt >= this.finishedAt) {
    return next(new Error("finishedAt must be after startedAt"));
  }
  next();
});

FlashcardStudySessionSchema.index({ ownerId: 1, finishedAt: -1 });

export const FlashcardStudySessionModel: mongoose.Model<FlashcardStudySession> =
  mongoose.models.FlashcardStudySession
    ? (mongoose.models.FlashcardStudySession as mongoose.Model<FlashcardStudySession>)
    : mongoose.model<FlashcardStudySession>("FlashcardStudySession", FlashcardStudySessionSchema);
