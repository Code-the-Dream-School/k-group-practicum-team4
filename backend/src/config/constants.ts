export const LIMITS = {
  TITLE_MAX_LENGTH: 200,
  TEXT_CONTENT_MAX_LENGTH: 100000,
  MAX_TAGS: 10,
  TAG_MAX_LENGTH: 30,
  PDF_MAX_SIZE: 10 * 1024 * 1024,
} as const;

export const MOCK_USER = {
  ID: process.env.MOCK_USER_ID || "test-user-dev-123",
  EMAIL: "test@example.com",
} as const;
