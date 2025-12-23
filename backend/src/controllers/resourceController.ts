import { Request, Response, NextFunction } from "express";
import { Resource } from "../models/Resource";
import { LIMITS } from "../config/constants";

// Create resource with plain text
export const createResource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, tags = [], textContent } = req.body;
    const userId = req.user?.id;

    // Enhanced validation using constants
    if (!title || !textContent) {
      return res.status(400).json({
        success: false,
        error: "Title and textContent are required",
      });
    }

    if (title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Title cannot be empty",
      });
    }

    if (title.length > LIMITS.TITLE_MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Title too long (max ${LIMITS.TITLE_MAX_LENGTH} chars)`,
      });
    }

    if (textContent.length > LIMITS.TEXT_CONTENT_MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Content too large (max ${
          LIMITS.TEXT_CONTENT_MAX_LENGTH / 1000
        }KB)`,
      });
    }

    // Tags validation using constants
    if (tags.length > LIMITS.MAX_TAGS) {
      return res.status(400).json({
        success: false,
        error: `Maximum ${LIMITS.MAX_TAGS} tags allowed`,
      });
    }

    const validatedTags = tags
      .map((tag: string) => tag.trim())
      .filter(
        (tag: string) => tag.length > 0 && tag.length <= LIMITS.TAG_MAX_LENGTH
      )
      .slice(0, LIMITS.MAX_TAGS); // Auto-limit to max tags

    const resource = new Resource({
      ownerId: userId,
      title: title.trim(),
      tags: validatedTags,
      textContent: textContent.trim(),
    });

    const savedResource = await resource.save();

    res.status(201).json({
      success: true,
      resource: savedResource,
    });
  } catch (error: any) {
    next(error);
  }
};
