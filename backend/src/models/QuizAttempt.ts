import mongoose, { Document, Schema } from "mongoose";

export interface IQuizAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedIndex: number;
  isCorrect: boolean;
  correctIndex: number;
}

export interface IQuizAttempt extends Document {
  ownerId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  answers: IQuizAnswer[];
  startedAt: Date;
  finishedAt: Date;
}

const QuizAnswerSchema = new Schema<IQuizAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "QuizQuestion",
      required: true,
    },
    selectedIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
  },
  {
    _id: false,
  }
);

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz ID is required"],
      index: true,
    },
    scorePercent: {
      type: Number,
      required: [true, "Score percentage is required"],
      min: [0, "Score must be at least 0"],
      max: [100, "Score cannot exceed 100"],
    },
    correctCount: {
      type: Number,
      required: [true, "Correct count is required"],
      min: [0, "Correct count must be non-negative"],
    },
    totalQuestions: {
      type: Number,
      required: [true, "Total questions is required"],
      min: [1, "Total questions must be at least 1"],
    },
    answers: {
      type: [QuizAnswerSchema],
      required: [true, "Answers are required"],
    },
    startedAt: {
      type: Date,
      required: [true, "Started at timestamp is required"],
    },
    finishedAt: {
      type: Date,
      required: [true, "Finished at timestamp is required"],
    },
  },
  {
    timestamps: false,
  }
);

QuizAttemptSchema.pre("validate", function (next) {
  if (this.startedAt >= this.finishedAt) {
    return next(new Error("finishedAt must be after startedAt"));
  }

  if (this.answers.length !== this.totalQuestions) {
    return next(
      new Error(
        `Answers count (${this.answers.length}) must match totalQuestions (${this.totalQuestions})`
      )
    );
  }

  next();
});

QuizAttemptSchema.index({ ownerId: 1, quizId: 1, finishedAt: -1 });
QuizAttemptSchema.index({ quizId: 1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>(
  "QuizAttempt",
  QuizAttemptSchema
);
