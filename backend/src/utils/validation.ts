import { LIMITS } from "../config/constants";

export const validateTitle = (
  title: string
): { isValid: boolean; error?: string } => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: "Title cannot be empty" };
  }

  if (title.length > LIMITS.TITLE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Title too long (max ${LIMITS.TITLE_MAX_LENGTH} chars)`,
    };
  }

  return { isValid: true };
};

export const validateTextContent = (
  content: string
): { isValid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: "Text content is required" };
  }

  if (content.length > LIMITS.TEXT_CONTENT_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Content too large (max ${
        LIMITS.TEXT_CONTENT_MAX_LENGTH / 1000
      }KB)`,
    };
  }

  return { isValid: true };
};

export const validateTags = (tags: string[]): string[] => {
  return tags
    .map((tag: string) => tag.trim())
    .filter(
      (tag: string) => tag.length > 0 && tag.length <= LIMITS.TAG_MAX_LENGTH
    )
    .slice(0, LIMITS.MAX_TAGS);
};

export const parseTags = (rawTags: any): string[] => {
  if (!rawTags) return [];

  if (typeof rawTags === "string") {
    return rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  if (Array.isArray(rawTags)) {
    return rawTags
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
  }

  return [];
};

// Simple text normalization (no DOM sanitization needed for plain text)
export const normalizeText = (text: string): string => {
  return text.trim();
};
