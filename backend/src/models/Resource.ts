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

  // for files for PDFs
  file?: {
    gridFsId: mongoose.Types.ObjectId;
    filename: string;
    mimeType: string;
    size: number;
  };

  summary?: ISummary;
  createdAt: Date;
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
  { _id: false }
); // Disable _id for embedded document

const ResourceSchema = new Schema<IResource>(
  {
    ownerId: {
      type: String,
      required: [true, "Owner ID is required"],
      trim: true,
      index: true, // Index for fast search by owner
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
    textContent: {
      type: String,
      required: [true, "Text content is required"],
      maxlength: [100000, "Text content cannot exceed 100,000 characters"], // 100KB limit
    },
    file: {
      gridFsId: {
        type: Schema.Types.ObjectId,
        ref: "uploads.files",
      },
      filename: {
        type: String,
        maxlength: [255, "Filename cannot exceed 255 characters"]
      },
      mimeType: {
        type: String,
        enum: ['application/pdf'],
        message: 'Only PDF files are supported'
      },
      size: {
        type: Number,
        max: [10 * 1024 * 1024, 'File size cannot exceed 10MB'] // 10MB limit
      }
    },
    summary: {
      type: SummarySchema,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Use custom createdAt field
  }
);

// Index for sorting by creation date
ResourceSchema.index({ createdAt: -1 });

// Compound index for searching user's resources
ResourceSchema.index({ ownerId: 1, createdAt: -1 });

export const Resource = mongoose.model<IResource>("Resource", ResourceSchema);
