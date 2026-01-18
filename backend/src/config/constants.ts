export const LIMITS = {
  TITLE_MAX_LENGTH: 200,
  TEXT_CONTENT_MAX_LENGTH: 100000, // 100KB for plain text content
  MAX_TAGS: 10,
  TAG_MAX_LENGTH: 30,
} as const;

export const validateEnv = () => {
  const required = ["MONGO_URI"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  console.log("Environment variables validated");
};
