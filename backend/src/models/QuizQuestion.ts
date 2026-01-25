import mongoose, { Document, Schema } from "mongoose";

export interface IQuizQuestion extends Document {
  quizId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  order: number;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz ID is required"],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
      index: true,
    },
    prompt: {
      type: String,
      required: [true, "Question prompt is required"],
      trim: true,
      maxlength: [1000, "Prompt cannot exceed 1000 characters"],
    },
    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: [
        {
          validator: (options: string[]) => options.length === 4,
          message: "Must have exactly 4 options",
        },
        {
          validator: (options: string[]) =>
            options.every((opt) => opt.trim().length > 0),
          message: "Options cannot be empty strings",
        },
      ],
    },
    correctIndex: {
      type: Number,
      required: [true, "Correct index is required"],
      min: [0, "Correct index must be between 0 and 3"],
      max: [3, "Correct index must be between 0 and 3"],
    },
    explanation: {
      type: String,
      required: [true, "Explanation is required"],
      trim: true,
      maxlength: [500, "Explanation cannot exceed 500 characters"],
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
      min: [0, "Order must be non-negative"],
    },
  },
  {
    timestamps: false,
  }
);

QuizQuestionSchema.index({ quizId: 1, order: 1 }, { unique: true });

export const QuizQuestion = mongoose.model<IQuizQuestion>(
  "QuizQuestion",
  QuizQuestionSchema
);
