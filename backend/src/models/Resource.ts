import mongoose, { Document, Schema } from "mongoose";

interface ISummary {
  content: string;
  createdAt: Date;
}

export interface IResource extends Document {
  ownerId: string;
  title: string;
  tags: string[];
  textContent: string;
  type: "plain_text";
  summary?: ISummary;
  createdAt: Date;
  updatedAt: Date;
}

const SummarySchema = new Schema<ISummary>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [5000, "Summary content cannot exceed 5000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false, // embedded document without its own id
  }
);

const ResourceSchema = new Schema<IResource>(
  {
    ownerId: {
      type: String,
      required: [true, "Owner ID is required"],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 10,
        message: "Maximum 10 tags allowed",
      },
    },
    textContent: {
      type: String,
      required: [true, "Text content is required"],
      maxlength: [100000, "Text content cannot exceed 100,000 characters"], // ~100KB
    },
    type: {
      type: String,
      enum: ["plain_text"],
      default: "plain_text",
      required: true,
    },
    summary: {
      type: SummarySchema,
      required: false,
    },
  },
  {
    timestamps: true, 
  }
);

// Indexes
ResourceSchema.index({ ownerId: 1, createdAt: -1 });

export const Resource = mongoose.model<IResource>("Resource", ResourceSchema);
