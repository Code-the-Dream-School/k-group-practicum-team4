import mongoose, { Document, Schema } from "mongoose";

export interface IQuiz extends Document {
  ownerId: mongoose.Types.ObjectId;
  resourceId: mongoose.Types.ObjectId;
  sequenceNumber: number;
  title: string;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: "Resource",
      required: [true, "Resource ID is required"],
    },
    sequenceNumber: {
      type: Number,
      required: [true, "Sequence number is required"],
      min: [1, "Sequence number must be at least 1"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    questionCount: {
      type: Number,
      required: [true, "Question count is required"],
      min: [1, "Question count must be at least 1"],
      max: [50, "Question count cannot exceed 50"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes provide efficient queries
QuizSchema.index({ ownerId: 1, resourceId: 1 });
QuizSchema.index({ ownerId: 1, createdAt: -1 });

export const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);
